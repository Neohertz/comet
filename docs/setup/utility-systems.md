# Utility Systems

Comet includes internal systems that wrap common Roblox Studio plugin APIs. You pull them in with `Dependency()` from your own systems just like any other dependency.

```ts
import { Dependency, GUI, OnInit, System } from "@rbxts/comet";

@System()
export class UiSystem implements OnInit {
	private gui = Dependency(GUI);

	onInit() {
		const widget = this.gui.createWidget("Inspector", new Vector2(320, 240), new Vector2(240, 180));
	}
}
```

These systems are internal and lazy by default, so they are only constructed when something depends on them.

## [GUI](/api/modules/gui)

`GUI` creates wrappers for plugin widgets, overlays, menus, and toolbar buttons.

### Handles

- Creating dock widgets.
- Creating viewport overlays.
- Building plugin menus.
- Creating toolbar buttons.

### Example

```ts
import { Dependency, GUI, OnInit, System } from "@rbxts/comet";

@System()
export class InspectorSystem implements OnInit {
	private gui = Dependency(GUI);

	onInit() {
		const widget = this.gui.createWidget(
			"Inspector",
			new Vector2(320, 240),
			new Vector2(240, 180),
			Enum.InitialDockState.Right
		);

		const button = this.gui.createButton(
			"Inspector",
			"Toggle the inspector",
			"rbxassetid://1234567890",
			true
		);

		widget.linkButton(button);
	}
}
```

### Notes

- Views start hidden by default. Call `setVisible(true)` yourself or use `linkButton()` with a toggleable button.
- `createWidget()` returns a `View` for a dock widget.
- `createOverlay()` returns a `View` intended for overlay UI.
- `buildMenu()` returns a `Menu` builder.
- `createButton()` returns a Comet `Button` wrapper.

## [History](/api/modules/history)

`History` wraps `ChangeHistoryService` for better undo and redo boundary handling.

### Handles

- Grouping changes into a single undo step.
- Canceling a failed operation.
- Appending a change to the previous history entry.
- Triggering explicit undo or redo actions.

### `record()`

`record()` starts a recording and returns a control object with three possible outcomes:

- `commit()` saves the recording.
- `append()` merges it with the previous recording when possible.
- `cancel()` aborts the recording and reverts the change.

```ts
import { Dependency, History, OnInit, System } from "@rbxts/comet";

@System()
export class EditSystem implements OnInit {
	private history = Dependency(History);

	onInit() {
		const recording = this.history.record("Create Part");
		const part = new Instance("Part");
		part.Parent = workspace;
		recording.commit();
	}
}
```

### `try()`

`try()` wraps a change in a pcall-style flow. If the callback succeeds, Comet finishes the recording with the configured success mode. If it fails, Comet cancels the recording and rethrows the error.

```ts
import { Dependency, History, System } from "@rbxts/comet";

@System()
export class SafeEditSystem {
	private history = Dependency(History);

	public async duplicateSelection() {
		await this.history.try(
			{
				name: "Duplicate Selection",
				onSuccess: "append",
			},
			() => {
				for (const instance of game.GetService("Selection").Get()) {
					instance.Clone().Parent = instance.Parent;
				}
			}
		);
	}
}
```

### Notes

- If a recording is left open and a new one begins, Comet cancels the older recording and logs a warning.
- `try()` defaults to `commit` when `onSuccess` is omitted.
- `try()` only catches errors thrown during the callback itself. It does not await asynchronous work started inside the callback before finishing the recording.
- `undo()` and `redo()` are direct wrappers over `ChangeHistoryService`.

## [Studio](/api/modules/studio)

`Studio` wraps common plugin APIs with a smaller, typed surface area.

### Handles

- Creating plugin actions.
- Reading or changing Studio selection.
- Listening for selection changes.
- Prompting for existing assets.
- Saving the current selection.
- Opening scripts or selecting ribbon tools.

### Example

```ts
import { Dependency, Studio, System } from "@rbxts/comet";

@System()
export class SelectionWatcherSystem {
	private studio = Dependency(Studio);

	constructor() {
		this.studio.onSelectionChanged((selection) => {
			print(`Selected ${selection.size()} instances`);
		});
	}
}
```

### Notes

- `studio.plugin` exposes the underlying `Plugin` instance.
- `saveSelection(true)` uses `Plugin.SaveSelectedToRoblox()`.
- `saveSelection(false, name)` uses `Plugin.PromptSaveSelection()`.
- `onSelectionChanged()` tracks its connection automatically, so Comet cleans it up on plugin unload.

## [Audio](/api/modules/audio)

`Audio` helps with plugin sound playback. It uses `GUI` internally to host `Sound` instances inside a view container.

### Handles

- Preloading UI sounds.
- Reusing cached sounds.
- Playing one-off sounds without managing cleanup manually.

### Example

```ts
import { Audio, Dependency, OnInit, System } from "@rbxts/comet";

@System()
export class SoundSystem implements OnInit {
	private audio = Dependency(Audio);

	onInit() {
		this.audio.preloadSounds([
			"rbxassetid://1234567890",
			"rbxassetid://0987654321",
		]);

		this.audio.play("rbxassetid://1234567890");
	}
}
```

### Notes

- `play()` reuses cached sounds and restarts them if needed.
- `playUnique()` creates a temporary `Sound`, plays it, and schedules cleanup through Comet's tracker.
- `preloadSounds()` warms the cache before playback.

## Choosing the right utility system

- Use `GUI` for plugin UI.
- Use `History` for undo and redo boundaries.
- Use `Studio` for plugin-facing Studio APIs.
- Use `Audio` for plugin sound playback.

For lifecycle behavior, dependency rules, and system registration, see [Systems](systems).
