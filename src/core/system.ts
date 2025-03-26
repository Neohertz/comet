import { CometState } from "../types/comet";
import { SystemConfig } from "../types/comet";
import { doesImplement } from "../util/guards";
import { OnHeartbeat, OnInit, OnRender, OnStart } from "../types/lifecycle";
import { ERROR } from "../util/errors";

const RunService = game.GetService("RunService");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SystemBase = any;

/**
 * Register State.dependencies of a given class.
 *
 * Takes in a list of arguments to pass to the constructor (optional)
 * @param fn
 */
export function registerSystem(
	state: CometState,
	ctor: { new (...args: unknown[]): {} },
	internal: boolean,
	config: SystemConfig
): SystemBase {
	const name = tostring(ctor);

	// If the module is an internal one, it should always be lazy.
	if (internal) {
		state.internal.add(name);
		config.lazy = true;
	}

	// If the module is lazy, let the dependency method handle the initialization.
	if (config.lazy) {
		state.lazy.add(name);
	} else {
		state.depTarget = name;
		const result = internal ? new ctor(state) : new ctor();
		state.registry.set(name, result);
		state.depTarget = undefined;
	}

	return ctor as SystemBase;
}

/**
 * Initialize the system by calling it's onInit() method. (if exists)
 * @param depName
 * @returns
 */
export function initializeSystem(state: CometState, depName: string) {
	if (state.initialized.has(depName)) return;
	state.initialized.add(depName);

	const service = state.registry.get(depName);
	assert(service, string.format(ERROR.SYSTEM_NOT_FOUND, depName));

	if (doesImplement<OnInit>(service, "onInit")) {
		service.onInit();
	}
}

export function launchSystems(state: CometState) {
	assert(state.appPlugin, ERROR.APP_NOT_CREATED);

	for (const depName of state.dependencies) initializeSystem(state, depName);
	for (const [depName] of state.registry) initializeSystem(state, depName);

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
