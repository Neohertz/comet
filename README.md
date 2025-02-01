# Comet

A fast plugin framework inspired by flamework.

## Example Usage:

```ts
// main-system.ts
import { CometView, System, onInit } from "@rbxts/comet";

export class MainSystem extends System implements onInit {
	public button: CometButton;
	public widget: CometView;

	constructor() {
		super();

		// Create both a tool bar button and widget.
		this.button = this.createButton("Toggle Plugin");
		this.widget = this.createWidget("My Awesome App", new Vector2(300, 800), Vector.zero);

		// Quickly link a button's state to a view's visibility.
		this.widget.linkButton(this.button);
	}

	public onInit(): void {
		// Easily mount your react tree.
		this.widget.mount((root) => SomeReactEntrypoint(root));
	}
}
```

```ts
// runtime.server.ts
import { Comet } from "@rbxts/comet";
import { MainSystem } from "./main-system.ts";

Comet.createApp(plugin, "My awesome plugin!", false);
Comet.registerSystem(MainSystem);
Comet.launch();
```

To learn more, visit the [Docs](https://neohertz.dev/docs/comet/about)

## Patch v1.0.5

-   Implemented `.track()` method to easily pass `RBXScriptConnections` and `Instances` to comet's internal maid.
    -   These instances will be automatically cleaned up when the plugin unloads.
-   Remove `.getJanitor()` method.
