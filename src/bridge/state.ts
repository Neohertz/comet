import { Janitor } from "@rbxts/janitor";
import { View } from "./private/view";
import { System, onEnd } from "..";
import { doesImplement } from "./types/guards";

/**
 * App is the container for the framework's state. Everything within this class should
 * remiain static as it is not instantiated.
 */
export class BridgeState {
	private constructor() {}

	static readonly systems = new Map<string, System>();
	static readonly windows = new Map<string, View>();
	static readonly janitor = new Janitor();

	static toolbar: PluginToolbar | undefined = undefined;
	static initialized: boolean = false;
	static plugin: Plugin;
	static name: string;

	// Flags
	static runInPlaytestEnabled: boolean = false;
	static debugEnabled: boolean = false;

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
