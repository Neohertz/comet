import { View } from "./private/view";
import { Menu } from "./private/menu";
import { Button } from "./private/button";
import { doesImplement } from "./types/guards";
import { RunService } from "@rbxts/services";
import { SFX } from "./private/sfx";
import { BridgeState } from "./state";

/**
 * Allows passing a class itself instead of an instnace.
 */
interface ClassRef<T> {
	new (): T;
}

/*
	Bridge.ts
	A compact plugin framework that abstracts the roblox plugin API into a single place.
*/
export class bridge {
	/**
	 * Create an app instance.
	 * @param plugin
	 * @param name
	 */
	static createApp(plugin: Plugin, name: string) {
		assert(!BridgeState.initialized, "[Bridge] App was initialized twice.");
		assert(plugin, "[Bridge] Passed reference to plugin is undefined.");
		BridgeState.plugin = plugin;
		BridgeState.initialized = true;
		BridgeState.name = name;
		BridgeState.plugin.Unloading.Connect(() => BridgeState.unload());
	}

	/**
	 * Add a system by reference to the framework.
	 * @param system
	 */
	static registerSystem(system: ClassRef<System>) {
		assert(BridgeState.initialized, "[Bridge] Attempted to add system before initializing app.");
		const newSystem = new system();
		BridgeState.systems.set(tostring(system), newSystem);
	}

	/**
	 * Currently testing. Not for use.
	 * @param system
	 * @deprecated
	 */
	static registerSystemFolder(system: Folder) {
		for (const inst of system.GetChildren()) {
			assert(inst.IsA("ModuleScript"), `[Bridge] "system" ${inst.Name} isn't a module.`);
			assert(inst.Source.find("System"), `[Bridge] system ${inst.Name} is not a valid system.`);
			const req = require(inst) as ClassRef<System>;
			this.registerSystem(req);
		}
	}

	/**
	 * Launch all systems in the framework.
	 * @returns
	 */
	static launch() {
		assert(BridgeState.initialized, "[Bridge] Attempted to launch before initializing app.");
		if (BridgeState.systems.size() === 0) BridgeState.log(warn, "No systems have been registered.");

		if (!BridgeState.runInPlaytestEnabled && RunService.IsRunning()) return;

		if (BridgeState.debugEnabled) {
			BridgeState.log(warn, "Debugging Enabled");
			BridgeState.log(print, `${BridgeState.systems.size()} systems registered.`);
		}

		// Initialize Systems
		for (const [key, system] of BridgeState.systems) {
			if (doesImplement<onInit>(system, "onInit")) {
				system.onInit();
			}
		}

		for (const [key, system] of BridgeState.systems) {
			// Start Systems
			if (doesImplement<onStart>(system, "onStart")) {
				task.spawn(() => system.onStart());
			}

			// Bind system to render stepped.
			if (doesImplement<onRender>(system, "onRender")) {
				BridgeState.janitor.Add(
					RunService.RenderStepped.Connect((dt) => {
						system.onRender(dt);
					}),
				);
			}
		}
	}

	static enableDebugging() {
		BridgeState.debugEnabled = true;
	}
}

export class System {
	/**
	 * A reference to plugin is suppled for extraordinary usage.
	 */
	readonly plugin: Plugin;

	/**
	 * A reference to the FX engine for sounds.
	 */
	private sfxManager: SFX;

	constructor() {
		this.sfxManager = new SFX();
		this.plugin = BridgeState.plugin;
	}

	/**
	 * Use the janitor.
	 * @returns Janitor
	 */
	getJanitor() {
		return BridgeState.janitor;
	}

	/**
	 * Used to require another system.
	 * ```
	 * this.DataService = this.use(DataService)
	 * ```
	 * @param base ctor
	 * @returns T
	 */
	use<T extends System>(base: ClassRef<T>): Omit<T, keyof System> {
		const classRef = BridgeState.systems.get(tostring(base));

		assert(
			classRef,
			`[Bridge] use(${tostring(base)}) called, but ${tostring(base)} has not been initialized. Did you forget to register the system?`,
		);

		return classRef as T;
	}

	/**
	 *
	 */
	playSFX(soundId: string | number, looped = false) {
		this.sfxManager.playSound(soundId, looped);
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
	buildMenu() {
		return new Menu();
	}

	/**
	 * Create a toolbar button.
	 * @param text
	 * @param toolTip
	 * @param image
	 * @returns
	 */
	createButton(text: string, toolTip = "", image = "", toggle = false) {
		return new Button(text, toolTip, image, toggle);
	}

	/**
	 * Creates and returns a view that is mounted within the viewport.
	 * @param name
	 */
	createOverlay(name: string): View {
		const window = new View(name);
		BridgeState.addWindow(name, window);
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
		BridgeState.addWindow(name, window);
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
 * | Lifecycle Methods
 */

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

export interface onRender {
	/**
	 * Called each frame using `RenderStepped`.
	 *
	 * @hideInherited
	 */
	onRender(dt: number): void;
}
