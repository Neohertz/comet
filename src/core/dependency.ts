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

	const depService = state.registry.get(depName);
	assert(depService, string.format(ERROR.SYSTEM_NOT_FOUND, depName));
	state.dependencies.push(depName);

	return depService as T;
}
