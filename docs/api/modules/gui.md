# GUI System
Allows you to define plugin UI elements easily.

::: warning
You must load this module via the `Dependency` global.
:::

## `createWidget()`
> Returns [View](/api/interface/view).

Create a dock widget.

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
@System()
class MySystem() {
	private GUI = Dependency(GUI)
	private view: View

	constructor() {
		this.view = GUI.createWidget("MyWidget", Vector2.zero, Vector2.zero)
	}
}
```

## `createOverlay()`
> Returns [View](/api/interface/view).

Create a overlay that is mounted to the studio viewport.

### Type
```ts
createOverlay(name: string): View
```

### Usage
```ts
@System()
class MySystem() {
	private GUI = Dependency(GUI)
	private view: View

	constructor() {
		this.view = GUI.createOverlay("MyOverlay")
	}
}
```

## `createButton()`
> Returns [Button](/api/interface/button).

Create a ribbon button.

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

### Usage
```ts
@System()
class MySystem() {
	private GUI = Dependency(GUI)
	private view: View
	private button: Button

	constructor() {
		this.view = GUI.createWidget("MyWidget", Vector2.zero, Vector2.zero)
		this.button = GUI.createButton("MyButton", "", "")

		// Control the view's visibility with the button.
		this.view.linkButton(this.button)
	}
}
```

## `buildMenu()`
See [Menu](/api/interface/menu).


