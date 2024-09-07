import { State } from "../state";

export namespace Networking {
	export interface Event<T extends unknown[] = []> {
		fire: (...args: T) => void;
		connect: (cb: (...args: T) => void) => RBXScriptConnection;
	}

	export interface Function<T extends unknown[], R> {
		invoke: (...args: T) => Promise<R>;
		callback: (cb: (...args: T) => R) => void;
	}

	export function Event<T extends Array<unknown> = []>(): Event<T> {
		const event = new Instance("BindableEvent", script);
		State.maid.Add(event);

		return {
			fire: (...args: T) => {
				event.Fire(...args);
			},
			connect: (cb: (...args: T) => void) => {
				return State.maid.Add(event.Event.Connect(cb));
			},
		};
	}

	export function Function<T extends Array<unknown>, R>(): Function<T, R> {
		const func = new Instance("BindableFunction", script);
		State.maid.Add(func);

		return {
			invoke: async (...args: T) => {
				return func.Invoke(...args) as R;
			},
			callback: (cb: (...args: T) => void) => {
				func.OnInvoke = cb;
			},
		};
	}
}
