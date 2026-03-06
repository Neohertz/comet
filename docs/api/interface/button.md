# Button
> Related: [GUI](/api/modules/gui)

`Button` wraps a `PluginToolbarButton` created through `GUI.createButton()`.

## `setEnabled()`

Sets the toolbar button's `Enabled` state.

### Type
```ts
setEnabled(state: boolean): void
```

## `setPressed()`

Sets the button's active state and then fires registered `onPress()` callbacks with the updated state.

### Type
```ts
setPressed(state: boolean): void
```

## `onPress()`

Registers a callback that runs whenever the button is pressed.

### Type
```ts
onPress(cb: (state: boolean) => void): Button
```

### Notes

- `state` is the current pressed state.
- Non-toggleable buttons still invoke the callback, but the state stays `false` unless you call `setPressed()` yourself.
- Use [View.linkButton()](/api/interface/view) if the button should directly control a view.