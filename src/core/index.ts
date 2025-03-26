import { doesImplement } from "../util/guards";
import { OnEnd } from "../types/lifecycle";
import { CometState } from "../types/comet";
import { Tracker } from "../util/tracker";
import { launchSystems, registerSystem, SystemBase } from "./system";
import { ClassRef, SystemConfig } from "../types/comet";
import { registerDependency } from "./dependency";
import { addSystemPath } from "./paths";

const state: CometState = {
	registry: new Map<string, SystemBase>(),
	dependencies: new Array<string>(),
	initialized: new Set<string>(),
	depTarget: undefined,

	toolbar: undefined,
	windows: new Map(),

	tracker: new Tracker(),

	appName: "Comet App",
	appPlugin: script.FindFirstAncestorWhichIsA("Plugin")!
};

/**
 * Namespace for all of comet's initialization code.
 */
export namespace Comet {
	/**
	 * @param plugin
	 * @param name
	 */
	export function createApp(name: string) {
		state.appName = name;

		// Register internal systems.
		Comet.addPaths(script.Parent?.FindFirstChild("systems"));

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
	 * Register systems within a parent instance. Searches recursively.
	 * @param path
	 */
	export function addPaths(path?: Instance) {
		addSystemPath(path);
	}

	/**
	 * Launch comet. Initialize all systems and dependencies, and launch any lifecycle methods.
	 */
	export function launch() {
		launchSystems(state);
	}
}

/**
 * Decorator that declares a class as a system.
 * @param config
 * @returns
 */
export function System(config?: SystemConfig) {
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
export function InternalSystem(config?: SystemConfig) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (ctor: any) {
		registerSystem(state, ctor, true, config);
	};
}

/**
 * Request a dependency for the system.
 *
 * **You should only ever request State.dependencies within a constructor**
 * @param dependency
 * @returns
 */
export function Dependency<T>(dependency: ClassRef<T>): T {
	return registerDependency(state, dependency);
}
