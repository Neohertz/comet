# Track
Track is comet's internal maid. You can use this to track instances and ensure they are cleaned up when the plugin unloads.

### Trackable Objects <Badge type="warning" text="as of v2.0.0" />
- RBXScriptConnections
- Threads
- Instances
- Functions


## Type
```ts
Track(object: TrackableObject)
```

## Usage

```ts
@System()
class MySystem implements OnInit {
	public onInit() {
		// Track Threads
		Track(task.spawn(() => {
			task.wait(10)
			print("Hello!")
		}))

		// Track Instances
		Track(new Instance("Part", Workspace))
	}
}
```