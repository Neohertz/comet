import { View } from "./internal/view";
import { Menu } from "./internal/menu";
import { Button } from "./internal/button";
import { doesImplement } from "./types/guards";
import { RunService, Workspace } from "@rbxts/services";
import { SFX } from "./internal/sfx";
import { State } from "./state";
import { PluginStore } from "./datastore";
import { Action } from "./internal/action";

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
		assert(!State.initialized, "[Comet] App was initialized twice.");
		assert(plugin, "[Comet] Plugin reference passed within createApp() is undefined!");
		State.plugin = plugin;

		State.initialized = true;
		State.name = name;
		State.plugin.Unloading.Connect(() => {
			let endCalls = 0;
			let windowsRemoved = 0;

			// HACK: Janitor is cleaned up first in case of react tree.
			State.maid.Cleanup();

			for (const system of State.systems) {
				// Unload all systems
				if (doesImplement<onEnd>(system, "onEnd")) {
					endCalls++;
					system.onEnd();
				}
			}

			for (const [k, v] of State.windows) {
				windowsRemoved++;
				v?.destroy();
			}

			if (State.debugEnabled)
				State.log(print, `System deactivated. [${endCalls} closure(s), ${windowsRemoved} window(s) removed.]`);
		});
	}

	/**
	 * Currently testing. Not for use in production
	 * @param defaultData
	 * @deprecated
	 */
	export function useDatastore<T extends object>(defaultData: T) {
		assert(State.plugin, "[Comet] `createApp` must be called before 'useDatastore()'");
		return new PluginStore(State.plugin, defaultData);
	}

	/**
	 * Add a system by reference to the framework.
	 * @param system
	 */
	export function registerSystem(system: ClassRef<System>) {
		assert(State.initialized, "[Comet] Attempted to add system before initializing app.");
		assert(!State.launched, "[Comet] Attempted to register system after calling launch().");

		const newSystem = new system();
		State.systems.set(tostring(system), newSystem);
	}

	/**
	 * Launch all systems in the framework.
	 * @returns
	 */
	export function launch() {
		assert(State.initialized, "[Comet] Attempted to launch before initializing app.");
		if (State.systems.size() === 0) State.log(warn, "No systems have been registered.");

		State.launched = true;

		if (!State.runInPlaytestEnabled && RunService.IsRunning()) return;

		if (State.debugEnabled) {
			State.log(warn, "Debugging Enabled");
			State.log(print, `${State.systems.size()} systems registered.`);
		}

		// Initialize Systems
		for (const [_, system] of State.systems) {
			if (doesImplement<onInit>(system, "onInit")) {
				system.onInit();
			}
		}

		for (const [_, system] of State.systems) {
			// Start Systems
			if (doesImplement<onStart>(system, "onStart")) {
				task.spawn(() => system.onStart());
			}

			// Bind system to render stepped.
			if (doesImplement<onRender>(system, "onRender")) {
				State.maid.Add(RunService.RenderStepped.Connect((dt) => system.onRender(dt)));
			}
		}
	}

	/**
	 * Enable verbose debugging.
	 */
	export function enableDebugging() {
		State.debugEnabled = true;
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
		this.plugin = State.plugin;

		this.historyService = game.GetService("ChangeHistoryService");
		State.maid.Add(this.historyService.OnRecordingStarted.Connect((name) => (this.lastRecording = name)));
	}

	/**
	 * Use the janitor.
	 * @returns Janitor
	 */
	getJanitor() {
		return State.maid;
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
		const classRef = State.systems.get(tostring(base));

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
	 * @param enabledWhenViewportHidden bool? = false
	 * @returns
	 */
	createButton(text: string, toolTip = "", image = "", toggleable = true, enabledWhenViewportHidden = false) {
		return new Button(text, toolTip, image, toggleable, enabledWhenViewportHidden);
	}

	/**
	 * Create an action that can be bound by the user.
	 * @param name
	 * @param statusTip
	 * @param icon
	 * @param allowBinding
	 * @returns
	 */
	createAction(id: string, name: string, statusTip: string, icon?: string, allowBinding?: boolean) {
		return new Action(id, name, statusTip, icon, allowBinding);
	}

	/**
	 * Creates and returns a view that is mounted within the viewport.
	 * @param name
	 */
	createOverlay(name: string): View {
		const window = new View(name);
		State.windows.set(name, window);
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
		State.windows.set(name, window);
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
		let recording = this.historyService.TryBeginRecording(name, description);

		if (recording === undefined) {
			State.log(
				warn,
				`Recording '${this.lastRecording}' has been canceled because a new one was started. Refactor your code to ensure the recording is always handled properly.`,
			);
			this.historyService.FinishRecording("", Enum.FinishRecordingOperation.Cancel, undefined);
			this.lastRecording = undefined;
			recording = this.historyService.TryBeginRecording(name, description);
		}

		this.lastRecording = recording;

		// NOTE: returning an object here as a class would be a bit unnecessary. This may change as it's not very uniform.
		return {
			/**
			 * Commits the recorded work to the history.
			 * @param options
			 */
			commit: (options?: object) => {
				this.historyService.FinishRecording(recording!, Enum.FinishRecordingOperation.Commit, options);
			},

			/**
			 * Commits the recorded work and merges with the previous recording if possible.
			 * @param options
			 */
			append: (options?: object) => {
				this.historyService.FinishRecording(recording!, Enum.FinishRecordingOperation.Append, options);
			},

			/**
			 * Cancel the recording, undoing any changes made.
			 * @param options
			 */
			cancel: (options?: object) => {
				this.historyService.FinishRecording(recording!, Enum.FinishRecordingOperation.Cancel, options);
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

	/**
	 * Bind a callback to selection changes.
	 */
	onSelectionChanged(cb: (sel: Instance[]) => void) {
		State.maid.Add(
			game.GetService("Selection").SelectionChanged.Connect(() => {
				cb(this.getSelection());
			}),
		);
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
