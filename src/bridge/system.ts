import { App } from "./app";
import { View } from "./util/view";
import { ClassRef } from "../util";
import { ContextMenu } from "./util/contextMenu";
import { ToolbarButton } from "./util/toolbarButton";

export class System {
	/**
	 * A reference to plugin is suppled for extraordinary usage.
	 */
	readonly plugin: Plugin;
	constructor() {
		this.plugin = App.plugin;
	}

	/**
	 * Use the janitor.
	 * @returns Janitor
	 */
	getJanitor() {
		return App.janitor;
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
		const classRef = App.systems.get(tostring(base));

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
	buildMenu() {
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
		App.addWindow(name, window);
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
		App.addWindow(name, window);
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
