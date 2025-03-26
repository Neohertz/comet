import { InternalSystem } from "../core";
import { CometState } from "../types/comet";

/**
 * An internal class that allows the user to get access to plugin related globals.
 */

@InternalSystem()
export class Meta {
	constructor(private state: CometState) {}

	/**
	 * Return the plugin instance.
	 * @returns
	 */
	public getPlugin() {
		return this.state.appPlugin;
	}

	/**
	 * Return the app's name.
	 * @returns
	 */
	public getAppName() {
		return this.state.appName;
	}
}
