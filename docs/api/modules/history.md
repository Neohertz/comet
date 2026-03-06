# History
`History` is an internal utility system for undo and redo recording.

Fetch it with `Dependency(History)` from one of your own systems.

## `record()`

Starts a `ChangeHistoryService` recording and returns control methods for finishing it.

### Type
```ts
record(name: string, description?: string): {
	commit(options?: object): void;
	append(options?: object): void;
	cancel(options?: object): void;
}
```

### Notes

- If another recording is still open, comet cancels the older recording, logs a warning, and starts a new one.
- `commit()` finishes with `Enum.FinishRecordingOperation.Commit`.
- `append()` finishes with `Enum.FinishRecordingOperation.Append`.
- `cancel()` finishes with `Enum.FinishRecordingOperation.Cancel`.

### Usage
```ts
const recording = this.history.record("Create Part");

const part = new Instance("Part");
part.Parent = workspace;

recording.commit();
```

## `try()`

Wraps `record()` in a `pcall`-style flow.

### Type
```ts
try<T extends Callback>(name: string, fn: T, ...args: Parameters<T>): Promise<ReturnType<T>>
try<T extends Callback>(
	config: {
		name: string;
		description?: string;
		onSuccess?: "commit" | "append" | "cancel";
	},
	fn: T,
	...args: Parameters<T>
): Promise<ReturnType<T>>
```

### Notes

- `onSuccess` defaults to `commit`.
- The callback itself is run with `pcall`. Errors thrown directly in the callback cancel the recording and are rethrown.
- `History.try()` does not await asynchronous work inside the callback before finishing the recording.

### Usage
```ts
await this.history.try(
	{
		name: "Duplicate Selection",
		onSuccess: "append",
	},
	() => {
		for (const instance of game.GetService("Selection").Get()) {
			instance.Clone().Parent = instance.Parent;
		}
	},
);
```

## `undo()`

Calls `ChangeHistoryService.Undo()`.

### Type
```ts
undo(): void
```

## `redo()`

Calls `ChangeHistoryService.Redo()`.

### Type
```ts
redo(): void
```