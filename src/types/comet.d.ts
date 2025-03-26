/**
 * Allows passing a class itself instead of an instance.
 */

import type { SystemBase } from "../core/system";
import { View } from "../modules/view";
import type { Tracker } from "../util/tracker";

export interface ClassRef<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): T;
}

export interface SystemConfig {
	/**
	 * Prevent the module from initializing unless it's depended upon.
	 *
	 * Mostly used internally.
	 */
	lazy?: boolean;
}

export interface CometState {
	registry: Map<string, SystemBase>;
	dependencies: Array<string>;
	initialized: Set<string>;
	internal: Set<string>;
	lazy: Set<string>;
	depTarget: string | undefined;

	toolbar: PluginToolbar | undefined;
	windows: Map<string, View>;

	tracker: Tracker;

	appName: string;
	appPlugin: Plugin;
}
