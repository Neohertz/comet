import { LogLevel } from "../core/enum";
import { LoggerConfig } from "../types/comet";

/**
 * A generic logging system. End user accessible!
 */
class LoggerInstance {
	private config: LoggerConfig;

	constructor() {
		this.config = {
			level: LogLevel.WARNING,
			showLevel: true
		};
	}

	private fmt(level: string, ...args: defined[]): string {
		let res = "";
		if (this.config.prefix !== undefined) res += `[${this.config.prefix}] `;
		if (this.config.showLevel) res += `[${level}] `;
		res += args.map((v) => tostring(v)).join(", ");
		return res;
	}

	/**
	 * Reconfigure the logger at runtime.
	 * @param config
	 * @hidden
	 */
	public updateLogger(config: LoggerConfig) {
		this.config = config;
	}

	/**
	 * Used for internal verbose logging.
	 * @param fn
	 * @param args
	 * @hidden
	 */
	public system(...args: defined[]) {
		if (this.config.level > LogLevel.SYSTEM) return;
		warn("COMET:DEBUG --", ...args);
	}

	/**
	 * Print a verbose message to the console.
	 * @param args
	 * @returns
	 */
	public verbose(...args: defined[]) {
		if (this.config.level > LogLevel.VERBOSE) return;
		print(this.fmt("VRB", ...args));
	}

	/**
	 * Print a warning to the console.
	 * @param args
	 * @returns
	 */
	public warn(...args: defined[]) {
		if (this.config.level > LogLevel.WARNING) return;
		warn(this.fmt("WARN", ...args));
	}

	/**
	 * Report an error to the console.
	 * @param args
	 * @returns
	 */
	public error(...args: defined[]) {
		if (this.config.level > LogLevel.ERROR) return;
		error(this.fmt("ERR", ...args), 2);
	}

	/**
	 * Report a fatal error to the console.
	 * @param args
	 * @returns
	 */
	public fatal(...args: defined[]) {
		if (this.config.level > LogLevel.FATAL) return;
		error(this.fmt("FATAL", ...args), 2);
	}
}

export const Logger = new LoggerInstance();
