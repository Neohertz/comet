import { View } from "./tools/view";
import { Menu } from "./tools/menu";
import { Button } from "./tools/button";
import { doesImplement } from "./types/guards";
import { RunService, Workspace } from "@rbxts/services";
import { SFX } from "./tools/sfx";
import { CometState } from "./state";

/**
 * Allows passing a class itself instead of an instance.
 */
interface ClassRef<T> {
	new (): T;
}

/*
	comet.ts
	A compact plugin framework that abstracts the roblox plugin API into a single place.
*/
export namespace Comet {
	/**
	 * Create an app instance.
	 * @param plugin
	 * @param name
	 */
	export function createApp(plugin: Plugin, name: string) {
		assert(!CometState.initialized, "[Comet] App was initialized twice.");
		assert(plugin, "[Comet] Plugin reference passed within createApp() is undefined!");
		CometState.plugin = plugin;
		CometState.initialized = true;
		CometState.name = name;
		CometState.plugin.Unloading.Connect(() => CometState.unload());
	}

	/**
	 * Add a system by reference to the framework.
	 * @param system
	 */
	export function registerSystem(system: ClassRef<System>) {
		assert(CometState.initialized, "[Comet] Attempted to add system before initializing app.");
		assert(!CometState.launched, "[Comet] Attempted to register system after calling launch().");

		const newSystem = new system();
		CometState.systems.set(tostring(system), newSystem);
	}

	/**
	 * Currently testing. Not for use.
	 * @param system
	 * @deprecated
	 */
	export function registerSystemFolder(system: Folder) {
		for (const inst of system.GetChildren()) {
			assert(inst.IsA("ModuleScript"), `[Comet] "system" ${inst.Name} isn't a module.`);
			assert(inst.Source.find("System"), `[Comet] system ${inst.Name} is not a valid system.`);
			const req = require(inst) as ClassRef<System>;
			registerSystem(req);
		}
	}

	/**
	 * Launch all systems in the framework.
	 * @returns
	 */
	export function launch() {
		assert(CometState.initialized, "[Comet] Attempted to launch before initializing app.");
		if (CometState.systems.size() === 0) CometState.log(warn, "No systems have been registered.");

		CometState.launched = true;

		if (!CometState.runInPlaytestEnabled && RunService.IsRunning()) return;

		if (CometState.debugEnabled) {
			CometState.log(warn, "Debugging Enabled");
			CometState.log(print, `${CometState.systems.size()} systems registered.`);
		}

		// Initialize Systems
		for (const [key, system] of CometState.systems) {
			if (doesImplement<onInit>(system, "onInit")) {
				system.onInit();
			}
		}

		for (const [key, system] of CometState.systems) {
			// Start Systems
			if (doesImplement<onStart>(system, "onStart")) {
				task.spawn(() => system.onStart());
			}

			// Bind system to render stepped.
			if (doesImplement<onRender>(system, "onRender")) {
				CometState.janitor.Add(
					RunService.RenderStepped.Connect((dt) => {
						system.onRender(dt);
					}),
				);
			}
		}
	}

	/**
	 * Enable verbose debugging.
	 */
	export function enableDebugging() {
		CometState.debugEnabled = true;
	}
}

export class System {
	/**
	 * A reference to plugin is supplied for extraordinary usage.
	 */
	readonly plugin: Plugin;
	private sfxManager: SFX;
	private lastRecording: string | undefined;
	private historyService: ChangeHistoryService;

	constructor() {
		this.sfxManager = new SFX();
		this.plugin = CometState.plugin;

		this.historyService = game.GetService("ChangeHistoryService");
		CometState.janitor.Add(this.historyService.OnRecordingStarted.Connect((name) => (this.lastRecording = name)));
	}

	/**
	 * Use the janitor.
	 * @returns Janitor
	 */
	getJanitor() {
		return CometState.janitor;
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
		const classRef = CometState.systems.get(tostring(base));

		assert(
			classRef,
			`[Comet] use(${tostring(base)}) called, but ${tostring(base)} has not been initialized. Did you forget to register the system?`,
		);

		return classRef as T;
	}

	/**
	 * Play a sound effect.
	 * This method caches all sounds and may yeild on first call.
	 * @param soundId string
	 * @param looped bool? (false)
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
	 * 	.separator()
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
	 * @param text string
	 * @param toolTip string
	 * @param image string
	 * @param toggleable bool? = true
	 * @returns
	 */
	createButton(text: string, toolTip = "", image = "", toggleable = true) {
		return new Button(text, toolTip, image, toggleable);
	}

	/**
	 * Creates and returns a view that is mounted within the viewport.
	 * @param name
	 */
	createOverlay(name: string): View {
		const window = new View(name);
		CometState.windows.set(name, window);
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
		CometState.windows.set(name, window);
		return window;
	}

	/**
	 * API for recoding waypoints to undo/redo history.
	 *
	 * ```ts
	 * const waypoint = this.record("My waypoint!");
	 *
	 * // Do some logic
	 * const part = new Instance("Part", Workspace);
	 *
	 * if (part) waypoint.commit();
	 * else waypoint.cancel();
	 * ```
	 * @param name
	 * @param description
	 * @returns object
	 */
	record(name: string, description?: string) {
		const recording = this.historyService.TryBeginRecording(name, description);
		assert(
			recording,
			`[Comet] Multiple Recordings: Attempted to start recording '${name}' but failed as recording '${this.lastRecording}' was never concluded.`,
		);

		// NOTE: returning an object here as a class would be a bit unnecessary. This may change as it's not very uniform.
		return {
			/**
			 * Commits the recorded work to the history.
			 * @param options
			 */
			commit: (options?: object) => {
				this.historyService.FinishRecording(recording, Enum.FinishRecordingOperation.Commit, options);
			},

			/**
			 * Commits the recorded work and merges with the previous recording if possible.
			 * @param options
			 */
			append: (options?: object) => {
				this.historyService.FinishRecording(recording, Enum.FinishRecordingOperation.Append, options);
			},

			/**
			 * Cancel the recording, undoing any changes made.
			 * @param options
			 */
			cancel: (options?: object) => {
				this.historyService.FinishRecording(recording, Enum.FinishRecordingOperation.Cancel, options);
			},
		};
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
	 * Called asynchronously after the system initializes.
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
