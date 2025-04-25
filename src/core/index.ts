import { doesImplement } from "../util/guards";
import {
	OnEnd,
	OnHeartbeat,
	OnInit,
	OnRender,
	OnStart
} from "../types/lifecycle";
import { TrackableObject, Tracker } from "../util/tracker";

import { ClassRef, CometState, SystemConfig } from "../types/comet";
import { CometError, LogLevel } from "./enum";
import { Logger } from "../util/logger";

const RunService = game.GetService("RunService");
const isRunning = RunService.IsRunning();

const cometState: CometState = {
	dependencies: new Array(),
	initialized: new Set(),
	depTarget: undefined,
	registry: new Map(),
	internal: new Set(),
	lazy: new Set(),

	loggerConfig: {
		level: LogLevel.FATAL,
		showLevel: true
	},

	toolbar: undefined,
	windows: new Map(),
	tracker: new Tracker(),

	runInPlayMode: false,
	appName: "Comet App",
	appPlugin: script.FindFirstAncestorWhichIsA("Plugin")!
};

/**
 * Asserts with at level 0.
 * @param condition
 * @param message
 */
function cleanAssert<T>(condition: T, message?: unknown): asserts condition {
	debug.traceback();
	if (!condition) error(`[Comet] ${message}`, 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SystemBase = any;

/**
 * Register a system internally.
 * @param ctor
 * @param internal
 * @param config
 * @returns ctor
 */
function registerSystem(
	ctor: { new (...args: unknown[]): {} },
	internal: boolean,
	config: SystemConfig
): SystemBase {
	const name = tostring(ctor);

	// If the module is an internal one, it should always be lazy.
	if (internal) {
		cometState.internal.add(name);
		config.lazy = true;
	}

	// If the module is lazy, let the dependency method handle the initialization.
	if (config.lazy) {
		cometState.lazy.add(name);
	} else {
		cometState.depTarget = name;
		const result = internal ? new ctor(cometState) : new ctor();
		cometState.registry.set(name, result);
		cometState.depTarget = undefined;
	}

	return ctor as SystemBase;
}

/**
 * Initialize a system internally
 * @param depName
 * @returns void
 */
function initializeSystem(depName: string) {
	if (cometState.initialized.has(depName)) return;
	cometState.initialized.add(depName);

	const service = cometState.registry.get(depName);
	cleanAssert(service, string.format(CometError.SYSTEM_NOT_FOUND, depName));

	if (doesImplement<OnInit>(service, "onInit")) {
		service.onInit();
	}

	Logger.system(`Initialized System (${depName})`);
}

/**
 * Decorator that declares a class as a system.
 * @param config
 * @returns
 */
export function System(config: SystemConfig = {}) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (ctor: any) {
		registerSystem(ctor, false, config);
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
		registerSystem(ctor, true, config);
	};
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
	cometState.tracker.handle(object);
}

/**
 * Get a reference to the plugin global.
 * @returns Plugin
 */
export function GetPlugin() {
	return cometState.appPlugin;
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
	cleanAssert(
		cometState.depTarget,
		CometError.DEPENDENCY_OUTSIDE_CONSTRUCTOR
	);

	const depName = tostring(dependency);
	cleanAssert(
		cometState.depTarget !== depName,
		string.format(CometError.SELF_DEPENDENCY, cometState.depTarget)
	);

	let depService: unknown = cometState.registry.get(depName);

	// Service is lazy loaded.
	if (cometState.lazy.has(depName)) {
		const lastTarget = cometState.depTarget;
		cometState.depTarget = depName;

		depService = cometState.internal.has(depName)
			? new dependency(cometState)
			: new dependency();

		cometState.registry.set(depName, depService);
		cometState.depTarget = lastTarget;
	}

	cleanAssert(depService, string.format(CometError.INVALID_SYSTEM, depName));
	cometState.dependencies.push(depName);

	Logger.system(
		`Resolved dependency (${cometState.depTarget} depends on ${depName})`
	);

	return depService as T;
}

/**
 * Namespace for all of comet's initialization methods.
 */
export namespace Comet {
	/**
	 * Initialize the comet app.
	 * @param plugin
	 * @param name
	 */
	export function createApp(name: string, enabledWhileRunning = false) {
		if (isRunning && !enabledWhileRunning) return;

		cometState.runInPlayMode = enabledWhileRunning;
		cometState.appName = name;

		cometState.appPlugin.Unloading.Once(() => {
			cometState.tracker.clean();

			for (const [name, system] of cometState.registry) {
				if (doesImplement<OnEnd>(system, "onEnd")) {
					system.onEnd();
					Logger.system(`Successfully unloaded ${name}.`);
				}
			}
		});
	}

	/**
	 * Register systems within a parent instance. Searches recursively!
	 * @param path
	 */
	export function addPaths(path?: Instance, recursive = false) {
		if (isRunning && !cometState.runInPlayMode) return;
		cleanAssert(path !== undefined, CometError.INVALID_PATH);

		const tsImpl = (_G as Map<unknown, unknown>).get(script) as object;

		const loadModule = doesImplement<{
			import: (a: LuaSourceContainer, b: LuaSourceContainer) => void;
		}>(tsImpl, "import")
			? (obj: ModuleScript) => tsImpl.import(script, obj)
			: require;

		const pool = recursive ? path.GetDescendants() : path.GetChildren();
		for (const obj of pool) {
			if (obj.IsA("ModuleScript")) {
				Logger.system(`addPaths() located a system. (${obj.Name})`);
				loadModule(obj);
			}
		}
	}

	/**
	 * Configure the internal logger. By default, the log level is set to `LogLevel.FATAL`.
	 *
	 * You can disable both the `level (i.e. "[VRB]")`  and the `name (i.e. "[My Plugin]")`.
	 * **These are both enabled by default**
	 * @param config
	 */
	export function configureLogger(
		level: LogLevel,
		showLevel = true,
		showPluginName = false
	) {
		Logger.updateLogger({
			level,
			showLevel,
			prefix: showPluginName ? cometState.appName : undefined
		});
	}

	/**
	 * Launch comet. Initialize all systems and dependencies, and launch any lifecycle methods.
	 */
	export function launch() {
		if (isRunning && !cometState.runInPlayMode) return;
		cleanAssert(cometState.appPlugin, CometError.APP_NOT_CREATED);

		for (const depName of cometState.dependencies)
			initializeSystem(depName);
		for (const [depName] of cometState.registry) initializeSystem(depName);

		Logger.system(
			`Successfully lauched ${cometState.registry.size()} systems. (${cometState.dependencies.size()} Dependencies resolved)`
		);

		for (const [_, service] of cometState.registry) {
			if (doesImplement<OnStart>(service, "onStart")) {
				cometState.tracker.handle(task.spawn(() => service.onStart()));
			}

			if (doesImplement<OnRender>(service, "onRender")) {
				cometState.tracker.handle(
					RunService.RenderStepped.Connect((dt) =>
						service.onRender(dt)
					)
				);
			}

			if (doesImplement<OnHeartbeat>(service, "onHeartbeat")) {
				cometState.tracker.handle(
					RunService.Heartbeat.Connect((dt) =>
						service.onHeartbeat(dt)
					)
				);
			}
		}
	}
}
