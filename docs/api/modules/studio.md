# Studio
`Studio` is an internal utility system that wraps common plugin APIs with a smaller, typed surface.

Fetch it with `Dependency(Studio)` from one of your own systems.

## `plugin`

Exposes the underlying `Plugin` instance.

## `getMouse()`

Activates the plugin and returns the mouse reference.

### Type
```ts
getMouse(exclusive = false): PluginMouse
```

## `createAction()`

Creates an [Action](/api/interface/action) wrapper.

### Type
```ts
createAction(
	id: string,
	name: string,
	statusTip: string,
	icon?: string,
	allowBinding?: boolean
): Action
```

## `selectTool()`

Selects a Studio ribbon tool.

### Type
```ts
selectTool(button: Enum.RibbonTool, position = UDim2.fromScale(0.5, 0.5)): void
```

## `saveSelection()`

Attempts to save the current selection.

### Type
```ts
saveSelection(saveLocally: boolean, suggestedFileName?: string): Promise<boolean>
```

### Notes

- If nothing is selected, this returns `false` immediately.
- In the current implementation, `saveSelection(true)` calls `Plugin.SaveSelectedToRoblox()` and returns `true`.
- `saveSelection(false, suggestedFileName)` calls `Plugin.PromptSaveSelection(suggestedFileName)` and returns that result.

## `requestAssetId()`

Prompts the user for an existing asset id of a supported asset type.

### Usage
```ts
const assetId = await this.studio.requestAssetId("Model");
```

## `openScript()`

Opens a script and returns the same object.

### Type
```ts
openScript<T extends LuaSourceContainer>(source: T, lineNumber?: number): T
```

## `getSelection()`

Returns the current Studio selection.

### Type
```ts
getSelection(): Instance[]
```

## `select()`

Sets the current Studio selection.

### Type
```ts
select(obj?: Instance | Instance[]): void
```

Calling `select()` with no argument clears the selection.

## `onSelectionChanged()`

Registers a callback for selection changes.

### Type
```ts
onSelectionChanged(fn: (selection: Instance[]) => void): void
```

### Notes

- The callback receives a fresh array from `Selection:Get()` each time the event fires.
- The connection is tracked automatically and cleaned up when the plugin unloads.

## Usage
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