import { CometState } from "../state";

export namespace Networking {
	export interface Event<T extends unknown[] = []> {
		fire: (...args: T) => void;
		connect: (cb: (...args: T) => void) => RBXScriptConnection;
	}

	export interface Function<T extends unknown[], R> {
		invoke: (...args: T) => Promise<R>;
		callback: (cb: (...args: T) => Promise<R>) => void;
	}

	const events = new Map<string, Event<unknown[]>>();

	export function Event<T extends Array<unknown> = []>(): Event<T> {
		const event = new Instance("BindableEvent", script);
		CometState.janitor.Add(event);

		return {
			fire: (...args: T) => {
				event.Fire(...args);
			},
			connect: (cb: (...args: T) => void) => {
				return CometState.janitor.Add(event.Event.Connect(cb));
			},
		};
	}

	export function Function<T extends Array<unknown>, R>(): Function<T, R> {
		const func = new Instance("BindableFunction", script);
		CometState.janitor.Add(func);

		return {
			invoke: async (...args: T) => {
				return (await func.Invoke(...args)) as R;
			},
			callback: (cb: (...args: T) => void) => {
				func.OnInvoke = cb;
			},
		};
	}
}
