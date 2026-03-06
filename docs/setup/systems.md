# Systems

Systems are Comet's main building block. A class decorated with `@System()` is registered once, constructed once, and managed for the lifetime of the plugin.

In practice, that means:

- Systems are singletons.
- Systems can depend on other systems.
- Lifecycle methods are called by Comet at predictable times.

## Defining a system

Decorate a class with `@System()` and optionally implement one or more lifecycle interfaces.

```ts
import { OnInit, System } from "@rbxts/comet";

@System()
export class SelectionSystem implements OnInit {
	onInit() {
		print("SelectionSystem initialized");
	}
}
```

Once the module is required through `Comet.addPaths()`, Comet registers the class. The instance is initialized later during `Comet.launch()`.

## Registration and launch

Comet startup happens in three stages:

1. `Comet.createApp()` configures the plugin app and unload handling.
2. `Comet.addPaths()` requires modules so decorated systems can register themselves.
3. `Comet.launch()` initializes systems and starts lifecycle hooks.

```ts
import { Comet } from "@rbxts/comet";

Comet.createApp("My Plugin");
Comet.addPaths(script.Parent!.WaitForChild("systems"), true);
Comet.launch();
```

::: warning
While the path argument within `Comet.addPaths()` can be undefined, it must point to a valid instance at runtime. Make sure the target instance exists before calling `addPaths()`.
:::

## Dependencies

Use `Dependency()` to grab another system instance.

```ts
import { Dependency, OnInit, System } from "@rbxts/comet";
import { SelectionSystem } from "./selection-system";

@System()
export class PropertiesPanelSystem implements OnInit {
	private selection = Dependency(SelectionSystem);

	onInit() {
		print("PropertiesPanelSystem ready", this.selection);
	}
}
```

### Where `Dependency()` is valid

Dependencies have to be requested during the constructor phase of a system. In practice, that means:

- Field initializers are valid.
- Constructor parameters are valid.
- Constructor body code is valid.
- `onInit()`, `onStart()`, and other methods are not valid.

```ts
import { Dependency, System } from "@rbxts/comet";
import { SelectionSystem } from "./selection-system";
import { StudioSystem } from "./studio-system";
import { HistorySystem } from "./history-system";

@System()
export class ValidDependencyUsage {
	// ✅ Valid - Compiles within constructor.
	private history = Dependency(HistorySystem);

	// ✅ Valid - Declared within constructor parameters or body.
	constructor(private selection = Dependency(SelectionSystem)) {
		const studio = Dependency(StudioSystem);
	}

	public setup() {
		// ❌ Invalid - Outside of constructor.
		const selection = Dependency(SelectionSystem);
	}
}
```

Comet enforces this at runtime. If you call `Dependency()` outside construction, you'll get an error.

### Dependency behavior

When a dependency is requested, Comet:

1. Verifies that another system is currently being constructed.
2. Rejects self-dependencies.
3. Creates lazy dependencies on demand.
4. Returns the singleton instance from the registry.
5. Records the dependency so it can be initialized before launch completes.

That gives you a predictable startup order without you having to sort anything manually.

### Lazy systems

`@System({ lazy: true })` prevents a system from being instantiated during registration. Instead, Comet constructs it the first time another system requests it through `Dependency()`.

```ts
import { OnInit, System } from "@rbxts/comet";

@System({ lazy: true })
export class DebugPanelSystem implements OnInit {
	onInit() {
		print("Only initializes if something depends on me");
	}
}
```

::: tip
Lazy only changes when the system is constructed. After that, it behaves like any other system.
:::

## Lifecycles

Lifecycle methods are optional, so you only implement the ones you actually need.

### `OnInit`

`onInit()` runs synchronously when Comet initializes the system.

- Use it for fast setup.
- Create connections, state, and UI here.
- Do not expect background tasks to have started yet.

```ts
import { OnInit, System } from "@rbxts/comet";

@System()
export class WidgetSystem implements OnInit {
	onInit() {
		print("Initialized immediately during launch");
	}
}
```

### `OnStart`

`onStart()` runs after initialization. Comet starts it asynchronously with `task.spawn()` during `Comet.launch()`.

- Use it for work that can wait until the system is ready.
- It may return a `Promise<void>`, but Comet does not await one system before starting the next.
- Do not rely on strict ordering between different systems' `onStart()` bodies.

```ts
import { OnStart, System } from "@rbxts/comet";

@System()
export class BootstrapSystem implements OnStart {
	async onStart() {
		print("Started asynchronously");
	}
}
```

### `OnRender`

`onRender(dt)` is connected to `RunService.RenderStepped` during launch.

- Use it for viewport or widget updates that need per-frame timing.
- `dt` is a number.

```ts
import { OnRender, System } from "@rbxts/comet";

@System()
export class PreviewSystem implements OnRender {
	onRender(dt: number) {
		// Frame-based UI or preview updates.
	}
}
```

### `OnHeartbeat`

`onHeartbeat(dt)` is connected to `RunService.Heartbeat` during launch.

- Use it for work that should happen on heartbeat instead of render.
- `dt` is a number.

```ts
import { OnHeartbeat, System } from "@rbxts/comet";

@System()
export class PollingSystem implements OnHeartbeat {
	onHeartbeat(dt: number) {
		// Simulation or polling work.
	}
}
```

### `OnEnd`

`onEnd()` runs when the plugin unloads.

- Use it for explicit cleanup.
- Tracked objects are cleaned automatically before unload callbacks run.
- Use it for shutdown logging or final persistence.

```ts
import { OnEnd, System } from "@rbxts/comet";

@System()
export class CleanupSystem implements OnEnd {
	onEnd() {
		print("Plugin unloading");
	}
}
```

## Lifecycle order

The full startup sequence looks like this:

1. Your modules are required with `Comet.addPaths()`.
2. Each decorated system is registered.
3. Non-lazy systems are constructed immediately.
4. Lazy systems are constructed when another system calls `Dependency()`.
5. `Comet.launch()` runs `onInit()` for all resolved dependencies and registered systems.
6. `Comet.launch()` then starts `onStart()`, `onRender()`, and `onHeartbeat()` hooks asynchronously.
7. When the plugin unloads, Comet cleans tracked resources and then calls `onEnd()`.

## Practical guidance

- Keep constructors light. Request dependencies and assign cheap state there.
- Put deterministic setup in `onInit()`.
- Put asynchronous boot work in `onStart()`.
- Use `Track()` for connections, instances, threads, and callbacks that should be cleaned up automatically. See the [Housekeeping](/setup/memory) section.

## Common mistakes

### Calling `Dependency()` outside construction

If you need another system later, store it during construction and reuse the reference.

### Forgetting to register modules

If `Comet.addPaths()` never requires the module, the decorator never runs, so the system never gets registered.

### Assuming `onStart()` ordering

`onStart()` is spawned asynchronously. If one system must prepare state before another uses it, do that work in `onInit()` instead.

### Creating manual cleanup for tracked objects

If you pass an object to `Track()`, Comet will clean it when the plugin unloads. Only add manual teardown if you need that cleanup to happen earlier.

## Related APIs

- [Comet](/api/globals/comet)
- [System](/api/globals/system)
- [Dependency](/api/globals/dependency)
