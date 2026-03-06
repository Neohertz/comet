# Audio
`Audio` is an internal utility system for plugin sound playback.

Fetch it with `Dependency(Audio)` from one of your own systems.

## `preloadSounds()`

Creates or reuses cached `Sound` instances and preloads them through `ContentProvider`.

### Type
```ts
preloadSounds(ids: string[]): Promise<void>
```

### Usage
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
	}
}
```

## `play()`

Plays a cached sound. If the sound has already been created, comet reuses it.

### Type
```ts
play(id: string, looped = false): void
```

### Usage
```ts
this.audio.play("rbxassetid://1234567890");
```

## `playUnique()`

Creates a new `Sound`, plays it, and schedules cleanup through comet's tracker.

### Type
```ts
playUnique(id: string, looped = false): Sound
```

### Notes

- The sound is not added to the cache.
- Cleanup is scheduled with `task.delay(sound.TimeLength, ...)`.

### Usage
```ts
const sound = this.audio.playUnique("rbxassetid://1234567890");
sound.Volume = 0.25;
```