import { RunService } from "@rbxts/services";
import { doesImplement } from "../guards";
import { App } from "./app";
import { onInit, onRender, onStart } from "../lifecycle";
import { System } from "./system";
import { ClassRef } from "../util";

/*
	Bridge.ts
	A compact plugin framework that abstracts the roblox plugin API into a single place.
*/
export class bridge {
	/**
	 * Create an app instance.
	 * @param plugin
	 * @param name
	 */
	static createApp(plugin: Plugin, name: string) {
		assert(!App.initialized, "[Bridge] App was initialized twice.");
		assert(plugin, "[Bridge] Passed reference to plugin is undefined.");
		App.plugin = plugin;
		App.initialized = true;
		App.name = name;
		App.plugin.Unloading.Connect(() => App.unload());
	}

	/**
	 * Add a system by reference to the framework.
	 * @param system
	 */
	static registerSystem(system: ClassRef<System>) {
		assert(App.initialized, "[Bridge] Attempted to add system before initializing app.");
		const newSystem = new system();
		App.systems.set(tostring(system), newSystem);
	}

	/**
	 * Currently testing. Not for use.
	 * @param system
	 * @deprecated
	 */
	static registerSystemFolder(system: Folder) {
		for (const inst of system.GetChildren()) {
			assert(inst.IsA("ModuleScript"), `[Bridge] "system" ${inst.Name} isn't a module.`);
			assert(inst.Source.find("System"), `[Bridge] system ${inst.Name} is not a valid system.`);
			const req = require(inst) as ClassRef<System>;
			this.registerSystem(req);
		}
	}

	/**
	 * Launch all systems in the framework.
	 * @returns
	 */
	static launch() {
		assert(App.initialized, "[Bridge] Attempted to launch before initializing app.");
		if (App.systems.size() === 0) App.log(warn, "No systems have been registered.");

		if (!App.runInPlaytestEnabled && RunService.IsRunning()) return;

		if (App.debugEnabled) {
			App.log(warn, "Debugging Enabled");
			App.log(print, `${App.systems.size()} systems registered.`);
		}

		// Initialize Systems
		for (const [key, system] of App.systems) {
			if (doesImplement<onInit>(system, "onInit")) {
				system.onInit();
			}
		}

		for (const [key, system] of App.systems) {
			// Start Systems
			if (doesImplement<onStart>(system, "onStart")) {
				task.spawn(() => system.onStart());
			}

			// Bind system to render stepped.
			if (doesImplement<onRender>(system, "onRender")) {
				App.janitor.Add(
					RunService.RenderStepped.Connect((dt) => {
						system.onRender(dt);
					}),
				);
			}
		}
	}

	static enableDebugging() {
		App.debugEnabled = true;
	}
}
