# History System
The history system provides a handy API for recording changes made by your plugin.

::: warning
You must load this module via the `Dependency` global.
:::

## `record()`
Method for recoding waypoints to undo/redo history.

### Usage
```ts
const recording = history.record("Do Stuff");

const [success, result] = pcall(() => {
	// do something
});

if (success) {
	recording.commit();
} else {
	recording.cancel();
}
```

## `try()`
A pcall-like wrapper for `record()` that allows you to quickly try an operation and abort changes if it fails.

### Usage
```ts
history.try("Try Making Parts", () => {
	// Example of some code that can error.
	for (let i = 0; i < 100; i++) {
		new Instance("Part", Workspace);
		if (math.random(1, 10) === 10) {
			error();
		}
	}
})
	.then(() => {
		print("Successfully created parts!!");
	})
	// If the code errors, all created parts will be undone.
	.catch((err) => {
		print("Failed to create parts!", err);
	});
```

## `undo()`
Undo the last action.

## `redo()`
Redo the last action.