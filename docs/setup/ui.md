# User Interface

Comet allows you to build your plugin's UI with any framework you like, or even just raw Roblox instances.

You get a [View](/api/interface/view) from [GUI.createWidget()](/api/modules/gui) or [GUI.createOverlay()](/api/modules/gui). Views start hidden by default, so call `setVisible(true)` or link one to a toggleable button.

## [View.mount()](/api/interface/view)
```ts
import { Dependency, GUI, OnInit, System } from "@rbxts/comet";

@System()
export class UiSystem implements OnInit {
	private gui = Dependency(GUI);

	onInit() {
		const view = this.gui.createWidget(
			"Inspector",
			new Vector2(320, 240),
			new Vector2(240, 180)
		);

		view.mount((root) => {
			const unmount = createUiTree(root);
			return () => unmount();
		});

		view.setVisible(true);
	}
}
```

Comet tracks the returned cleanup callback for you, so the UI unmounts automatically when the plugin unloads.

## Framework runtimes

For React, Vide, Fusion, or similar libraries, pass a function that mounts into `root` and returns that framework's cleanup function.

```ts
view.mount((root) => {
	const handle = mountReactApp(root);
	return () => handle.unmount();
});
```

```ts
view.mount((root) => {
	const stop = mountVideApp(root);
	return () => stop();
});
```

If you are not using a UI framework, you can just mount plain Roblox instances directly:

```ts
const frame = new Instance("Frame");
view.mount(frame);
```

## Linking a toolbar button

If the view should be user-toggleable, pair it with a [Button](/api/interface/button).

```ts
const view = this.gui.createWidget(
	"Inspector",
	new Vector2(320, 240),
	new Vector2(240, 180),
);

const button = this.gui.createButton(
	"Inspector",
	"Toggle the inspector",
	"rbxassetid://1234567890",
	true,
);

view.linkButton(button);
```
