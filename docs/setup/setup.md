# Setup Project

## 1. Define Your Systems

### `main-system.ts`
```ts
// src/systems/main-system.ts
import { Button, Dependency, OnEnd, OnInit, System, View } from "@rbxts/comet";
import { ExampleSystem } from "systems/example";

@System()
export class MainSystem implements OnInit, OnEnd {
	public exampleSystem = Dependency(ExampleSystem);
	public openButton: Button;
	public widget: View;

	onInit(): void {
		print(this.exampleSystem.message); // "Hello, World!"
	}

	onEnd(): void {
		print("Plugin has unloaded.");
	}
}

```

### `example-system.ts`

```ts
// src/systems/example-system.ts
import { OnInit, System } from "@rbxts/comet";

@System()
export class ExampleSystem implements OnInit {
	public message?: string;

	onInit(): void {
		print("Example system initialized!");
		this.message = "Hello, World!";
	}
}

```

## 2. Create App & Register Systems
```ts
// src/init.server.ts
import { Comet } from "@rbxts/comet";

Comet.createApp("My awesome plugin!");
Comet.addPaths(script.Parent.Systems);
...
```

## 3. Launch!
```ts
...
Comet.launch()
```
<br>

---
Looking for more information? Check out the [API Docs](/api/globals/comet).