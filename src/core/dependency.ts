import { ClassRef } from "../types/comet";
import { ERROR } from "../util/errors";
import { CometState } from "../types/comet";

/**
 * Register an internal dependency.
 * @param state
 * @param dependency
 * @returns
 */
export function registerDependency<T>(state: CometState, dependency: ClassRef<T>): T {
	assert(state.depTarget, ERROR.DEPENDENCY_OUTSIDE_CONSTRUCTOR);

	const depName = tostring(dependency);
	assert(state.depTarget !== depName, string.format(ERROR.SELF_DEPENDENCY, state.depTarget));

	let depService: unknown = state.registry.get(depName);

	// Service is lazy loaded.
	if (state.lazy.has(depName)) {
		const lastTarget = state.depTarget;
		state.depTarget = depName;

		depService = state.internal.has(depName) ? new dependency(state) : new dependency();
		state.registry.set(depName, depService);
		state.depTarget = lastTarget;
	}

	assert(depService, string.format(ERROR.INVALID_SYSTEM, depName));
	state.dependencies.push(depName);

	return depService as T;
}
