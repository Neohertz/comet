# GUI
`GUI` is an internal utility system for building plugin UI wrappers.

Fetch it with `Dependency(GUI)` from one of your own systems.

## `createWidget()`

Creates a dock widget [View](/api/interface/view).

### Type
```ts
createWidget(
	name: string,
	size: Vector2,
	minSize: Vector2,
	dockState?: Enum.InitialDockState
): View
```

### Usage
```ts
import { Dependency, GUI, OnInit, System } from "@rbxts/comet";

@System()
export class MySystem implements OnInit {
	private gui = Dependency(GUI);

	onInit() {
		const view = this.gui.createWidget(
			"My Widget",
			new Vector2(320, 240),
			new Vector2(240, 180),
		);

		view.setVisible(true);
	}
}
```

## `createOverlay()`

Creates an overlay [View](/api/interface/view) backed by a `ScreenGui` in `CoreGui`.

### Type
```ts
createOverlay(name: string): View
```

### Usage
```ts
const overlay = this.gui.createOverlay("Selection Overlay");
overlay.setVisible(true);
```

## `buildMenu()`

Creates a [Menu](/api/interface/menu) builder.

### Type
```ts
buildMenu(): Menu
```

## `createButton()`

Creates a toolbar [Button](/api/interface/button).

### Type
```ts
createButton(
	text: string,
	toolTip: string,
	image: string,
	toggleable?: boolean,
	enabledOutsideViewport?: boolean
): Button
```

### Notes

- `toggleable` defaults to `true`.
- `enabledOutsideViewport` maps to `ClickableWhenViewportHidden` and defaults to `false`.

### Usage
```ts
const view = this.gui.createWidget(
	"My Widget",
	new Vector2(320, 240),
	new Vector2(240, 180),
);

const button = this.gui.createButton(
	"Toggle Widget",
	"Show or hide the widget",
	"rbxassetid://1234567890",
	true,
);

view.linkButton(button);
```


