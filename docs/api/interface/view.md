# View
> Related: [GUI](/api/modules/gui)

`View` is comet's UI container abstraction. A view wraps either a dock widget or a viewport overlay and gives you a consistent API for mounting UI.

## Visibility

Views start hidden by default. After mounting content, either call `setVisible(true)` yourself or link the view to a toggleable [Button](/api/interface/button) with `linkButton()`.

## `mount()`

Mounts UI into the view.

### Type
```ts
mount<T extends GuiBase>(element: T, createCopy?: boolean): T;
mount(method: (root: Instance) => () => void): void;
```

### Notes

- The direct-instance overload reparents the `GuiBase` into the view.
- Set `createCopy` to `true` to clone the element before it is reparented.
- The function overload is intended for React, Fusion, Vide, or any other UI runtime that returns an unmount callback.

### Usage
```ts
view.mount((root) => {
	const unmount = createReactTree(root);
	return () => unmount();
});
```

```ts
const frame = new Instance("Frame");
view.mount(frame);
```

## `onClose()`

Registers a callback that fires when a dock widget is closed by any source.

### Type
```ts
onClose(cb: () => void): void
```

## `onOpen()`

Registers a callback that fires when a dock widget is opened manually.

### Type
```ts
onOpen(cb: () => void): void
```

## `isVisible()`

Returns the view's visibility state.

### Type
```ts
isVisible(): boolean
```

## `setVisible()`

Sets the view's enabled state.

### Type
```ts
setVisible(state: boolean): void
```

## `linkButton()`

Synchronizes a toggleable toolbar button with the view's visibility.

::: warning
This throws if the button is not toggleable.
:::

### Type
```ts
linkButton(button: Button): void
```

When the view is closed, comet also clears the linked button's pressed state.

## `getViewportSize()`

Returns `container.AbsoluteSize`.

### Type
```ts
getViewportSize(): Vector2
```

