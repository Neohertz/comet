# Housekeeping

Comet handles most plugin cleanup for you, but it still helps to know what the framework tracks automatically and where you should call [Track](/api/globals/tracker) yourself.

As a rule of thumb, if a Comet API created or registered the resource, Comet will clean it up on unload. If you created it yourself with plain Roblox APIs, you should track it manually.

## Automatic cleanup

Comet already tracks framework-managed resources like:

- Threads started for system `onStart()` hooks.
- Connections created for `onRender()` and `onHeartbeat()` hooks.
- Connections created by [Studio](/api/modules/studio), such as `onSelectionChanged()`.
- Resources created through Comet wrappers like [View](/api/interface/view), [Menu](/api/interface/menu), and [Audio](/api/modules/audio).

Because of that, you do not need to manually tear down internal systems, widget wrappers, or connections created by Comet APIs.

```ts
import { GUI, Dependency, OnInit, Studio, System } from "@rbxts/comet";

@System()
export class InspectorSystem implements OnInit {
	private gui = Dependency(GUI);
	private studio = Dependency(Studio);

	onInit() {
		const widget = this.gui.createWidget(
			"Inspector",
			new Vector2(320, 240),
			new Vector2(240, 180)
		);

		this.studio.onSelectionChanged((selection) => {
			print(`Selected ${selection.size()} instances`);
		});
	}
}
```

## [Track](/api/globals/tracker)

Use `Track()` for resources Comet does not know about but should still clean up on unload.

```ts
import { OnInit, System, Track } from "@rbxts/comet";

@System()
export class PreviewSystem implements OnInit {
	onInit() {
		const folder = new Instance("Folder");
		Track(folder);
		folder.Name = "PreviewObjects";
		folder.Parent = game.GetService("CoreGui");

		Track(game.GetService("Selection").SelectionChanged.Connect(() => {
			print("Selection changed");
		}));

		Track(task.spawn(() => {
			while (true) {
				task.wait(1);
				print("Still running");
			}
		}));

		Track(() => {
			print("Unload callback");
		});
	}
}
```


## Cleanup order

Unload happens in this order:

1. Comet cleans everything registered through [Track](/api/globals/tracker).
2. Comet then calls each system's `onEnd()` method. See [Systems](/setup/systems).

That means `onEnd()` should not assume tracked objects are still around.

::: tip
If you need shutdown logic that depends on some object, either do that work before unload or do not register that object with [Track](/api/globals/tracker) until that behavior makes sense.
:::

## Practical guidance

- Prefer Comet APIs such as [GUI](/api/modules/gui), [Studio](/api/modules/studio), and [Audio](/api/modules/audio) when they fit the job.
- Use [Track](/api/globals/tracker) for raw Roblox resources you create yourself.
- Use `onEnd()` for shutdown work such as persistence or final logging rather than routine resource cleanup.
