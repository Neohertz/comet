# Action
> Related: [Studio](/api/modules/studio)

`Action` wraps a `PluginAction` created through `Studio.createAction()`.

## `onTrigger()`

Registers a callback that fires when the plugin action is triggered.

### Type
```ts
onTrigger(cb: () => void): void
```

### Notes

- The callback fires whether the action was invoked from a keybind, the command palette, or another Studio entry point.
- The connection is tracked automatically and cleaned up when the plugin unloads.

### Usage
```ts
action.onTrigger(() => {
	print("Action triggered");
});
```
