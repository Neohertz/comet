import type { SystemBase } from "../core/system";
import type { Log } from "../util/log";
import type { Tracker } from "../util/tracker";

export interface CometState {
	registry: Map<string, SystemBase>;
	dependencies: Array<string>;
	initialized: Set<string>;

	tracker: Tracker;
	logger: Log;

	appName: string | undefined;
	appPlugin: Plugin | undefined;
}
