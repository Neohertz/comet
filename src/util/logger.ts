import { LogLevel } from "../core/enum";
import { cometState } from "../core/state";

function fmt(prefix: string, ...args: defined[]): string {
	let res = "";
	if (cometState.loggerConfig.showPluginName)
		res += `[${cometState.appName}] `;
	if (cometState.loggerConfig.showLevel) res += `[${prefix}] `;
	res += args.map((v) => tostring(v)).join(", ");
	return res;
}

/**
 * A generic logging system. End user accessible!
 */
class LoggerInstance {
	/**
	 * Used for internal verbose logging.
	 * @param fn
	 * @param args
	 * @hidden
	 */
	public system(...args: defined[]) {
		if (cometState.loggerConfig.level > LogLevel.SYSTEM) return;
		warn("COMET:DEBUG --", ...args);
	}

	/**
	 * Print a verbose message to the console.
	 * @param args
	 * @returns
	 */
	public verbose(...args: defined[]) {
		if (cometState.loggerConfig.level > LogLevel.VERBOSE) return;
		print(fmt("VRB", ...args));
	}

	/**
	 * Print a warning to the console.
	 * @param args
	 * @returns
	 */
	public warn(...args: defined[]) {
		if (cometState.loggerConfig.level > LogLevel.WARNING) return;
		warn(fmt("WARN", ...args));
	}

	/**
	 * Report an error to the console.
	 * @param args
	 * @returns
	 */
	public error(...args: defined[]) {
		if (cometState.loggerConfig.level > LogLevel.ERROR) return;
		error(fmt("ERR", ...args), 2);
	}

	/**
	 * Report a fatal error to the console.
	 * @param args
	 * @returns
	 */
	public fatal(...args: defined[]) {
		if (cometState.loggerConfig.level > LogLevel.FATAL) return;
		error(fmt("FATAL", ...args), 2);
	}
}

export const Logger = new LoggerInstance();
