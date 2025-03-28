import { doesImplement } from "../util/guards";
import { OnEnd } from "../types/lifecycle";
import { CometState } from "../types/comet";
import { TrackableObject, Tracker } from "../util/tracker";
import { launchSystems, registerSystem } from "./system";
import { ClassRef, SystemConfig } from "../types/comet";
import { registerDependency } from "./dependency";
import { addSystemPath } from "./paths";

const isRunning = game.GetService("RunService").IsRunning();

const state: CometState = {
	dependencies: new Array(),
	initialized: new Set(),
	depTarget: undefined,
	registry: new Map(),
	internal: new Set(),
	lazy: new Set(),

	toolbar: undefined,
	windows: new Map(),

	tracker: new Tracker(),

	runInPlayMode: false,
	appName: "Comet App",
	appPlugin: script.FindFirstAncestorWhichIsA("Plugin")!
};

/**
 * Namespace for all of comet's initialization code.
 */
export namespace Comet {
	/**
	 * Initialize the comet app.
	 * @param plugin
	 * @param name
	 */
	export function createApp(name: string, enabledWhileRunning = false) {
		if (isRunning && !enabledWhileRunning) return;

		state.runInPlayMode = enabledWhileRunning;
		state.appName = name;

		state.appPlugin.Unloading.Once(() => {
			state.tracker.clean();

			for (const [_, system] of state.registry) {
				if (doesImplement<OnEnd>(system, "onEnd")) {
					system.onEnd();
				}
			}
		});
	}

	/**
	 * Register systems within a parent instance. Searches recursively!
	 * @param path
	 */
	export function addPaths(path?: Instance, recursive = false) {
		if (isRunning && !state.runInPlayMode) return;
		addSystemPath(path, recursive);
	}

	/**
	 * Launch comet. Initialize all systems and dependencies, and launch any lifecycle methods.
	 */
	export function launch() {
		if (isRunning && !state.runInPlayMode) return;
		launchSystems(state);
	}
}

/**
 * Decorator that declares a class as a system.
 * @param config
 * @returns
 */
export function System(config: SystemConfig = {}) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (ctor: any) {
		registerSystem(state, ctor, false, config);
	};
}

/**
 * Decorator for internal classes. Injects comet's state into the constructor.
 * @param config
 * @returns
 */
export function InternalSystem(config: SystemConfig = {}) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (ctor: any) {
		registerSystem(state, ctor, true, config);
	};
}

/**
 * Request a system.
 *
 * **You should only ever request dependencies within a constructor**
 *
 * ## Example Usage
 * ```ts
 * class MySystem implements OnInit {
 * 	// ✅ Valid
 * 	private gui = Dependency(GUI)
 *
 * 	constructor(
 * 		// ✅ Valid
 * 		private audio = Dependency(Audio)
 * 	) {
 * 		// ✅ Valid
 * 		const studio = Dependency(Studio)
 * 	}
 *
 * 	onInit() {
 * 		// ❌ Invalid! Cannot use Dependency() outside of constructor.
 * 		const history = Dependency(History)
 * 	}
 * }
 * ```
 * @param dependency
 * @returns
 */
export function Dependency<T>(dependency: ClassRef<T>): T {
	return registerDependency(state, dependency);
}

/**
 * Track an object. This object will be cleaned up whenever the plugin unloads.
 *
 * Can handle any instance, callback, thread, connection, etc.
 *
 * ## Example Usage
 * ```ts
 * ...
 * onInit() {
 * 	Track(new Instance("Part")) // Will delete the part on plugin unload.
 * }
 * ...
 * ```
 * @param object
 */
export function Track(object: TrackableObject) {
	state.tracker.handle(object);
}

/**
 * Get a reference to the plugin global.
 * @returns Plugin
 */
export function GetPlugin() {
	return state.appPlugin;
}
