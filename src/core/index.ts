import { t } from "@rbxts/t";
import { doesImplement } from "../types/guard";
import { OnInit, OnRender, OnStart, OnHeartbeat, OnEnd } from "../types/lifecycle";
import { Log } from "../util/log";
import { Errors } from "../util/errors";
import { CometState } from "../types/state";
import { Tracker } from "../util/tracker";
import { SystemBase, SystemConfig } from "./system";

/**
 * Allows passing a class itself instead of an instance.
 */
export interface ClassRef<T> {
	new (): T;
}

const state: CometState = {
	registry: new Map<string, SystemBase>(),
	dependencies: new Array<string>(),
	initialized: new Set<string>(),

	tracker: new Tracker(),
	logger: new Log(),

	appName: undefined,
	appPlugin: undefined,
};

const RunService = game.GetService("RunService");

let target: string | undefined = undefined;

function initialize(depName: string) {
	if (state.initialized.has(depName)) return;
	state.initialized.add(depName);

	const service = state.registry.get(depName);
	assert(service, string.format(Errors.SYSTEM_NOT_FOUND, depName));

	if (doesImplement<OnInit>(service, "onInit")) {
		service.onInit();
	}
}

/**
 * Register State.dependencies of a given class.
 * @param fn
 */
export function InitSystem(ctor: ClassRef<SystemBase>, config?: SystemConfig): SystemBase {
	const name = tostring(ctor);
	target = name;

	const result = state.registry.get(name) ?? new ctor();
	state.registry.set(name, result);

	target = undefined;
	return result;
}

/**
 * Namespace for all of comet's initialization code.
 */
export namespace Comet {
	/**
	 * @param plugin
	 * @param name
	 */
	export function createApp(plugin: Plugin, name: string) {
		state.appPlugin = plugin;
		state.appName = name;

		plugin.Unloading.Once(() => {
			state.tracker.clean();

			for (const [name, system] of state.registry) {
				if (doesImplement<OnEnd>(system, "onEnd")) {
					system.onEnd();
				}
			}
		});
	}

	export function addPaths(path: unknown) {
		assert(state.appPlugin, "You must create the app first.");
		const tsImpl = (_G as Map<unknown, unknown>).get(script);

		const loadModule = t.interface({
			import: t.callback,
		})(tsImpl)
			? (module: unknown) => tsImpl.import(script, module)
			: require;

		for (const obj of (path as Instance).GetChildren()) {
			if (obj.IsA("ModuleScript")) {
				loadModule(obj);
			}
		}
	}

	export function launch() {
		assert(state.appPlugin, "You must create the app first.");
		state.logger.warn("----- INITIALIZING ------");
		for (const depName of state.dependencies) initialize(depName);
		for (const [depName] of state.registry) initialize(depName);

		for (const [_, service] of state.registry) {
			if (doesImplement<OnStart>(service, "onStart")) {
				state.tracker.handle(task.spawn(() => service.onStart()));
			}

			if (doesImplement<OnRender>(service, "onRender")) {
				state.tracker.handle(RunService.RenderStepped.Connect((dt) => service.onRender(dt)));
			}

			if (doesImplement<OnHeartbeat>(service, "onHeartbeat")) {
				state.tracker.handle(RunService.Heartbeat.Connect((dt) => service.onHeartbeat(dt)));
			}
		}
	}
}

/**
 * Request a dependency for the system.
 *
 * **You should only ever request State.dependencies within a constructor**
 * @param dependency
 * @returns
 */
export function Dependency<T>(dependency: ClassRef<T>): T {
	assert(target, Errors.DEPENDENCY_OUTSIDE_CONSTRUCTOR);
	const depName = tostring(dependency);

	if (target === depName) {
		error(string.format(Errors.SELF_DEPENDENCY, target));
	}

	const depService = state.registry.get(depName);
	assert(depService, string.format(Errors.SYSTEM_NOT_FOUND, depName));
	state.dependencies.push(depName);

	return dependency as T;
}
