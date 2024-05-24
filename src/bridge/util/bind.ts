import { App } from "../app";

/**
 * A simple bindable event system.
 */
export class Bind<I extends Array<unknown>> {
	private bind: BindableEvent;

	constructor() {
		this.bind = new Instance("BindableEvent", script);
		App.janitor.Add(this.bind);
	}

	connect(callback: (...args: I) => void): void {
		App.janitor.Add(this.bind.Event.Connect(callback));
	}

	fire(...args: I): void {
		this.bind.Fire(...args);
	}
}
