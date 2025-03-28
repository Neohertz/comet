import { LogLevel } from "./enum";
import { CometState } from "../types/comet";
import { Tracker } from "../util/tracker";

export const cometState: CometState = {
	dependencies: new Array(),
	initialized: new Set(),
	depTarget: undefined,
	registry: new Map(),
	internal: new Set(),
	lazy: new Set(),

	loggerConfig: {
		level: LogLevel.FATAL,
		showLevel: true,
		showPluginName: true
	},

	toolbar: undefined,
	windows: new Map(),
	tracker: new Tracker(),

	runInPlayMode: false,
	appName: "Comet App",
	appPlugin: script.FindFirstAncestorWhichIsA("Plugin")!
};
