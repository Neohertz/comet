/**
 * A class that handles data storage as well as (maybe) session locking
 */

import Sift from "@rbxts/sift";

const DS_KEY = "__COMET_DS";
const SL_KEY = "__COMET_SL";

export class PluginStore<T extends object> {
	public readonly state: T;
	private plugin: Plugin;

	constructor(plugin: Plugin, defaultState: T) {
		this.plugin = plugin;
		this.state = Sift.Dictionary.copyDeep(defaultState);

		const sessionLocked = (plugin.GetSetting(SL_KEY) as boolean | undefined) ?? false;

		if (sessionLocked) {
			warn("[Comet] [DS] Existing session detected. Data will not be availible.");
		} else {
			plugin.SetSetting(SL_KEY, true);

			const currentData = plugin.GetSetting(DS_KEY);

			if (currentData !== undefined) {
				this.state = currentData as T;
			} else {
				plugin.SetSetting(DS_KEY, this.state);
			}
		}
	}

	forceSave() {
		this.plugin.SetSetting(DS_KEY, this.state);
	}

	close() {
		this.plugin.SetSetting(DS_KEY, this.state);
		this.plugin.SetSetting(SL_KEY, false);
	}
}
