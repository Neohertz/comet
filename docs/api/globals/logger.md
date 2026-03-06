# Logger
`Logger` is comet's shared logging utility. You can use it from your own systems and configure it with [Comet.configureLogger()](/api/globals/comet).

## Log Levels

1. `SYSTEM` prints comet's internal debug messages.
2. `VERBOSE` prints verbose messages and everything above it.
3. `WARNING` prints warnings, errors, and fatals.
4. `ERROR` prints errors and fatals.
5. `FATAL` prints only fatal errors.
6. `SILENT` disables all logger output.

## Methods

- `Logger.verbose(...args)` prints with a `VRB` prefix.
- `Logger.warn(...args)` prints with a `WARN` prefix.
- `Logger.error(...args)` throws with an `ERR` prefix.
- `Logger.fatal(...args)` throws with a `FATAL` prefix.

`Logger.system(...args)` also exists, but it is intended for comet's internal debug output.

## Notes

- Without `Comet.configureLogger()`, the logger starts at `LogLevel.WARNING`.
- `showLevel` and plugin-name prefixing are controlled through `Comet.configureLogger()`.
- `Logger.error()` and `Logger.fatal()` do not just print; they raise errors.

## Usage
```ts
import { Logger, OnInit, System } from "@rbxts/comet";

@System()
export class MySystem implements OnInit {
	public onInit() {
		Logger.warn("Widget state is out of date");
	}
}
```