export class Log {
	warn(message: string) {
		warn(`[Comet] ${message}`);
	}

	asrt<T>(condition: T, message: string): asserts condition {
		assert(condition, `[Comet] ${message}`);
	}
}
