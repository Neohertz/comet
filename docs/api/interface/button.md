
# Button
> Related: [GUI System](/api/modules/gui)

## `setEnabled()`
Set the `Enabled` state of the toolbar button.

### Usage
```ts filename="Type"
this.setEnabled(state: boolean): void
```

## `setPressed()`
Set the `Active` state of the toolbar button. Also toggles the `Enabled` state as well.

### Usage
```ts filename="Type"
this.setPressed(state: boolean): void
```

## `onPress()`
Bind a callback that is invoked whenever the button is pressed.

### Usage
```ts filename="Type"
this.onPress(cb: (state: boolean) => void): void
```

You can also bind a button directly to the visibility of a view.
See the [view](/api/interface/view) documentation for more information.