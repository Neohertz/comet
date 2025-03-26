class Logger {
	warn(message: string) {
		warn(`[Comet] ${message}`);
	}
}

export const Log = new Logger();
