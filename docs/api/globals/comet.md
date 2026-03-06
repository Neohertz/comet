# Comet
`Comet` exposes the framework bootstrap API. In a typical plugin, you call these methods in order: `createApp()`, `addPaths()`, then `launch()`.

## `createApp()`

Registers unload handling and sets the plugin name used for the toolbar.

### Type
```ts
createApp(name: string, enabledWhileRunning = false): void
```

### Notes

- `name` becomes the toolbar name used by [GUI](/api/modules/gui).
- If Studio is currently running and `enabledWhileRunning` is `false`, this call becomes a no-op.
- Unload cleanup is registered here, so call this before launching comet.

### Usage
```ts
import { Comet } from "@rbxts/comet";

Comet.createApp("My Plugin");
```

## `addPaths()`

Requires modules from an instance so decorated systems can register themselves.

### Type
```ts
addPaths(path?: Instance, recursive = false): void
```

### Notes

- Although the signature marks `path` as optional, the implementation asserts that a valid instance is present at runtime.
- When `recursive` is `true`, comet scans descendants. Otherwise it scans only direct children.
- Only `ModuleScript` children are loaded.
- If Studio is currently running and the app was not created with `enabledWhileRunning = true`, this call becomes a no-op.

### Usage
```ts
import { Comet } from "@rbxts/comet";

Comet.addPaths(script.Parent!.WaitForChild("systems"), true);
```

## `configureLogger()`

Configures the shared [Logger](/api/globals/logger) instance used by comet.

### Type
```ts
configureLogger(level: LogLevel, showLevel = true, showPluginName = false): void
```

### Notes

- `showLevel` controls whether prefixes such as `[WARN]` are included.
- `showPluginName` adds the app name from `createApp()` as a prefix.
- This updates the logger at runtime.

### Usage
```ts
import { Comet, LogLevel } from "@rbxts/comet";

Comet.configureLogger(LogLevel.ERROR, false, false);
```

## `launch()`

Initializes registered systems, resolves queued dependencies, and starts lifecycle hooks.

::: warning
Call this only after `createApp()` and `addPaths()` have run.
:::

### Type
```ts
launch(): void
```

### Notes

- `onInit()` runs before any `onStart()`, `onRender()`, or `onHeartbeat()` hook is attached.
- `onStart()` is spawned with `task.spawn()`.
- `onRender()` and `onHeartbeat()` are connected through `RunService` and tracked for cleanup.
- If Studio is currently running and the app was not created with `enabledWhileRunning = true`, this call becomes a no-op.

### Usage
```ts
import { Comet } from "@rbxts/comet";

Comet.launch();
```
