import { Janitor } from "@rbxts/janitor";
import { HttpService, RunService } from "@rbxts/services";

/*
	Bridge.ts
	A compact plugin framework that abstracts the roblox plugin API into a single place.
*/

/**
 * Allows passing a class itself instead of an instnace
 */
interface ISystemPBR<T> {
	new (): T;
}

export interface onInit {
	/**
	 * Called synchronously when the system starts.
	 */
	onInit(): void;
}

export interface onStart {
	/**
	 * Called asyncronously after the system initializes.
	 */
	onStart(): void | Promise<void>;
}

export interface onEnd {
	/**
	 * Called when the plugin is unloaded.
	 * @returns void
	 */
	onEnd(): void;
}

export type BridgeButton = ToolbarButton;
export type BridgeView = View;

/**
 * Called each frame using `RenderStepped`.
 */
export interface onRender {
	onRender(dt: number): void;
}

// Guards
function doesImplement<T extends object>(object: object, member: keyof T): object is T {
	return member in object;
}

/**
 * STATE
 */
const janitor = new Janitor();
const windows = new Map<string, View>();
const systems = new Map<string, System>();

let toolbar: PluginToolbar | undefined = undefined;
let plugin: Plugin;
let appName: string;
let appInitialized: boolean;

// Flags
let debugEnabled: boolean;
let runInPlaytestEnabled: boolean;

/**
 * Internal API
 */

function log(method: (val: string) => void, val: string) {
	method(`[Bridge] ${val}`);
}

function addWindow(id: string, window: View) {
	windows.set(id, window);
}

function getWindow(id: string) {
	return windows.get(id);
}

function unload() {
	let endCalls = 0;
	let windowsRemoved = 0;

	for (const system of systems) {
		if (doesImplement<onEnd>(system, "onEnd")) {
			endCalls++;
			system.onEnd();
		}
	}

	for (const [k, v] of windows) {
		windowsRemoved++;
		v.destroy();
	}

	if (debugEnabled) log(print, `System deactivated. [${endCalls} closure(s), ${windowsRemoved} window(s) removed.]`);

	janitor.Cleanup();
}

/**
 * Bridge API
 */
export const bridge = {
	/**
	 * Create an app instance.
	 * @param m_plugin
	 * @param m_Name
	 */
	createApp(m_plugin: Plugin, m_Name: string) {
		assert(!appInitialized, "[Bridge] App was initialized twice.");
		assert(m_plugin, "[Bridge] Passed reference to plugin is undefined.");

		appInitialized = true;
		plugin = m_plugin;
		appName = m_Name;
		plugin.Unloading.Connect(() => unload());
	},

	/**
	 * Add a system by reference to the framework.
	 * @param system
	 */
	registerSystem(system: ISystemPBR<System>) {
		assert(appInitialized, "[Bridge] Attempted to add system before initializing app.");
		const newSystem = new system();
		systems.set(tostring(system), newSystem);
	},

	/**
	 * Currently testing. Not for use.
	 * @param system
	 * @deprecated
	 */
	registerSystemFolder(system: Folder) {
		for (const inst of system.GetChildren()) {
			assert(inst.IsA("ModuleScript"), `[Bridge] "system" ${inst.Name} isn't a module.`);
			assert(inst.Source.find("System"), `[Bridge] system ${inst.Name} is not a valid system.`);
			const req = require(inst) as ISystemPBR<System>;
			this.registerSystem(req);
		}
	},

	/**
	 * Launch all systems in the framework.
	 * @returns
	 */
	launch() {
		assert(appInitialized, "[Bridge] Attempted to launch before initializing app.");

		if (!runInPlaytestEnabled && RunService.IsRunning()) return;

		if (debugEnabled) {
			log(warn, "Debugging Enabled");
			log(print, `${systems.size()} systems registered.`);
		}

		for (const [key, system] of systems) {
			if (doesImplement<onInit>(system, "onInit")) {
				system.onInit();
			}
		}

		for (const [key, system] of systems) {
			if (doesImplement<onStart>(system, "onStart")) {
				task.spawn(() => system.onStart());
			}

			if (doesImplement<onRender>(system, "onRender")) {
				janitor.Add(
					RunService.RenderStepped.Connect((dt) => {
						system.onRender(dt);
					}),
				);
			}
		}
	},

	enableDebugging() {
		debugEnabled = true;
	},
};

/**
 * Used interanally by the framework to manage state.
 *
 * Do not interact with this unless you know what you are doing.
 */

export class System {
	private isLoaded = false;

	/**
	 * A reference to plugin is suppled for extraordinary usage.
	 */
	readonly plugin: Plugin;

	constructor() {
		this.plugin = plugin;
		this.isLoaded = true;
	}

	/**
	 * Use the janitor.
	 * @returns Janitor
	 */
	getJanitor() {
		return janitor;
	}

	/**
	 * Used to require another system.
	 * ```
	 * this.DataService = this.use(DataService)
	 * ```
	 * @param base ctor
	 * @returns T
	 */
	use<T extends System>(base: ISystemPBR<T>): Omit<T, keyof System> {
		const classRef = systems.get(tostring(base));

		assert(
			classRef,
			`[Bridge] use(${tostring(base)}) called, but ${tostring(base)} has not been initialized. Did you forget to register the system?`,
		);

		return classRef as T;
	}

	/**
	 * Build a context menu.
	 *
	 * ```ts
	 * const menu = this.contexMenuBuilder("MyMenu")
	 * 	.action("Clear Workspace", "", () => {})
	 * 	.seperator()
	 * 	.submenu("Misc")
	 * 		.action("Spawn Part", "", () => {})
	 *
	 * menu.show()
	 * ```
	 * @param title
	 * @param icon
	 * @returns
	 */
	menuBuilder() {
		return new ContextMenu();
	}

	/**
	 * Create a toolbar button.
	 * @param text
	 * @param toolTip
	 * @param image
	 * @returns
	 */
	createButton(text: string, toolTip = "", image = "", toggle = false) {
		return new ToolbarButton(text, toolTip, image, toggle);
	}

	/**
	 * Creates and returns a view that is mounted within the viewport.
	 * @param name
	 */
	createOverlay(name: string): View {
		const window = new View(name);
		addWindow(name, window);
		return window;
	}

	/**
	 * Create and returns a view that is mounted within a dockable widget.
	 * @param name string
	 * @param size Vector2
	 * @param maxSize Vector2
	 * @param dockState Enum.InitialDockState?
	 */
	createWidget(name: string, size: Vector2, maxSize: Vector2, dockState?: Enum.InitialDockState): View {
		const window = new View(name, size, maxSize, dockState);
		addWindow(name, window);
		return window;
	}

	/**
	 * Returns an array of the currently selected items.
	 * @returns
	 */
	getSelection(): Instance[] {
		return game.GetService("Selection").Get();
	}

	/**
	 * Select instances.
	 * If no items are supplied to this function, it will deselect all
	 * @param obj? Instance | Instance[]
	 */
	select(obj?: Instance | Instance[]) {
		game.GetService("Selection").Set(obj ? (typeIs(obj, "table") ? (obj as Instance[]) : [obj]) : []);
	}
}

/**
 * This class utilizes builder functions to easily construct context menus.
 */
class ContextMenu {
	private rootMenu: PluginMenu;
	private currentMenu: PluginMenu;

	private menus: PluginMenu[];
	private actions: PluginAction[];

	constructor() {
		this.menus = new Array();
		this.actions = new Array();

		this.rootMenu = plugin.CreatePluginMenu(HttpService.GenerateGUID());
		this.currentMenu = this.rootMenu;

		this.menus.push(this.rootMenu);

		janitor.Add(() => this.cleanup());
	}

	private cleanup() {
		this.menus.forEach((e) => e.Destroy());
		this.actions.forEach((e) => e.Destroy());
	}

	/**
	 * Async function that shows context menu. Responses are handled in action declaration.
	 */
	async show() {
		this.rootMenu.ShowAsync();
	}

	/**
	 * Seperate Menu
	 */
	seperator() {
		this.currentMenu.AddSeparator();
		return this;
	}

	/**
	 * Define an action.
	 * @param title
	 * @param icon
	 * @param cb
	 * @returns
	 */
	action(title: string, icon?: string, cb?: () => void) {
		const action = this.currentMenu.AddNewAction(HttpService.GenerateGUID(), title, icon);
		janitor.Add(action);
		janitor.Add(action.Triggered.Connect(() => cb?.()));
		return this;
	}

	/**
	 * Creates and selects a submenu in the builder.
	 * @param title
	 * @param icon
	 */
	submenu(title?: string, icon?: string) {
		const menu = plugin.CreatePluginMenu(HttpService.GenerateGUID(), title, icon);
		menu.Title = title ?? "";
		this.currentMenu.AddMenu(menu);
		this.currentMenu = menu;
		this.menus.push(this.currentMenu);
		return this;
	}

	/**
	 * Selects the root menu. Useful for adding top-level context menu items after a submenu.
	 */
	root() {
		this.currentMenu = this.rootMenu;
		return this;
	}
}

class ToolbarButton {
	private button: PluginToolbarButton;
	private state: boolean;

	private toggleable: boolean;

	constructor(text: string, toolTip: string, image: string, toggleable: boolean) {
		if (!toolbar) {
			toolbar = plugin.CreateToolbar(appName);
		}

		this.button = toolbar.CreateButton(text, toolTip, image);
		this.toggleable = toggleable;
		this.state = false;
	}

	/**
	 * Set the button's press state (visually)
	 * @param state
	 */
	setPressed(state: boolean) {
		this.state = state;
		this.button.SetActive(this.state);
		this.button.Enabled = !this.button.Enabled;
		this.button.Enabled = true;
	}

	/**
	 * Listen to button presses on this toolbar button.
	 * @param cb State of button (if toggleable)
	 */
	onPress(cb: (state: boolean) => void) {
		janitor.Add(
			this.button.Click.Connect(() => {
				if (this.toggleable) {
					this.state = !this.state;
				}

				this.button.SetActive(this.state);
				this.button.Enabled = !this.button.Enabled;
				this.button.Enabled = true;

				cb(this.state);
			}),
		);

		return this;
	}
}

/**
 * A view is a container for GUI elements.
 */
class View {
	private container: DockWidgetPluginGui | ScreenGui;

	/**
	 * Create a window that renders on the viewport.
	 * @param app
	 * @param name
	 */
	constructor(name: string);
	/**
	 * Create a window that renders in a widget.
	 * @param name
	 * @param size
	 * @param maxSize
	 */
	constructor(name: string, size: Vector2, maxSize: Vector2, dockState?: Enum.InitialDockState);
	constructor(name: string, size?: Vector2, maxSize?: Vector2, dockState = Enum.InitialDockState.Float) {
		assert(!getWindow(name), "[Bridge] Detected multiple windows with the same name.");

		if (size && maxSize) {
			this.container = plugin.CreateDockWidgetPluginGui(
				HttpService.GenerateGUID(),
				new DockWidgetPluginGuiInfo(dockState, false, true, size.X, size.Y, maxSize.X, maxSize.Y),
			);
			(this.container as DockWidgetPluginGui).Title = name;
		} else {
			this.container = new Instance("ScreenGui", game.GetService("CoreGui"));
			this.container.IgnoreGuiInset = true;
			this.container.Enabled = false;
			janitor.Add(this.container);
		}
	}

	/**
	 * Fired whenever the window closes.
	 * @param cb
	 */
	onClose(cb: () => void) {
		if ("BindToClose" in this.container) {
			this.container.BindToClose(() => cb());
		}
	}

	/**
	 * Fired whenever the window opens.
	 * @param cb
	 */
	onOpen(cb: () => void) {}

	/**
	 * Set visibility of the window.
	 * @param state boolean
	 */
	setVisible(state: boolean) {
		if (this.container) {
			this.container.Enabled = state;
		}
	}

	/**
	 * If the viewport is enabled, it will return its size.
	 * @returns Vector2
	 */
	getViewportSize(): Vector2 | undefined {
		if (this.container.Enabled) return this.container.AbsoluteSize;
	}

	/**
	 * Mount a GuiBase instance to the window.
	 * @param element `GuiBase`
	 */
	mount<T extends GuiBase>(element: T): void;
	/**
	 * Custom mounting method. Used to integrate ui-libraries like react and fusion.
	 * @param method (root: Instance) => (() => void)
	 */
	mount<T extends GuiBase>(method: (root: Instance) => () => void): void;
	mount<T extends GuiBase>(element: T | ((root: Instance) => () => void)) {
		assert(this.container, "Container instance is nill. This is most likely a bug.");

		if (typeIs(element, "function")) {
			const cb = element(this.container);
			janitor.Add(() => cb());
		} else {
			(element as GuiBase).Parent = this.container;
			janitor.Add(element);
			return element;
		}
	}

	/**
	 * Only to be called internally.
	 */
	destroy() {
		this.container?.Destroy();
	}
}
