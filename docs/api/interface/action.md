
# Action
> Related: [Studio System](/api/modules/studio)

## `onTrigger()`
Subscribe to the trigger event of the action. This event is fired whenever the action is triggered, whether through a keybind or through the command palette.

### Usage
```ts filename="Type"
myAction.onTrigger(() => {
	Logger.verbose("Action triggered!")
})
```
