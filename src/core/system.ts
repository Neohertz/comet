import { ClassRef, InitSystem } from ".";
export class SystemBase {}

export interface SystemConfig {
	loadOrder?: number;
}

/**
 * Decorator that declares a class as a system.
 * @param config
 * @returns
 */
export function System<T extends ClassRef<SystemBase>>(config?: SystemConfig) {
	return function (ctor: T) {
		InitSystem(ctor, config);
	};
}
