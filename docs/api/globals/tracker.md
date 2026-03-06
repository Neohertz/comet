# Track
`Track()` registers a resource with comet's internal tracker so it is cleaned up when the plugin unloads.

## Trackable objects

- `Instance`
- `RBXScriptConnection`
- `thread`
- `Callback`

## Type
```ts
Track(object: TrackableObject): void
```

## Notes

- Tracked instances are destroyed.
- Tracked connections are disconnected.
- Tracked threads are canceled.
- Tracked callbacks are invoked.
- Cleanup happens before comet calls system `onEnd()` methods.

## Usage
```ts
import { OnInit, System, Track } from "@rbxts/comet";

@System()
export class MySystem implements OnInit {
	public onInit() {
		Track(task.spawn(() => {
			task.wait(10);
			print("Hello!");
		}));

		Track(new Instance("Part", workspace));
	}
}
```