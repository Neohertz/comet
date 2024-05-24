import { Janitor } from "@rbxts/janitor";
import { doesImplement } from "../guards";
import { onEnd } from "../lifecycle";
import { View } from "./util/view";
import { System } from "./system";

/**
 * App is the container for the framework's state. Everything within this class should
 * remiain static as it is not instantiated.
 */
export class App {
	private constructor() {}

	static janitor = new Janitor();
	static windows = new Map<string, View>();
	static systems = new Map<string, System>();

	static toolbar: PluginToolbar | undefined = undefined;
	static plugin: Plugin;
	static name: string;
	static initialized: boolean;

	// Flags
	static debugEnabled: boolean;
	static runInPlaytestEnabled: boolean;

	static log(method: (val: string) => void, val: string) {
		method(`[Bridge] ${val}`);
	}

	static addWindow(id: string, window: View) {
		this.windows.set(id, window);
	}

	static getWindow(id: string) {
		return this.windows.get(id);
	}

	static unload() {
		let endCalls = 0;
		let windowsRemoved = 0;

		for (const system of this.systems) {
			// Unload all systems
			if (doesImplement<onEnd>(system, "onEnd")) {
				endCalls++;
				system.onEnd();
			}
		}

		for (const [k, v] of this.windows) {
			windowsRemoved++;
			v.destroy();
		}

		if (this.debugEnabled)
			this.log(print, `System deactivated. [${endCalls} closure(s), ${windowsRemoved} window(s) removed.]`);

		this.janitor.Cleanup();
	}
}
