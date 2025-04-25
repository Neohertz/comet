# Audio System
A system that provides easy methods for playing sounds from your plugin.

::: warning
You must load this module via the `Dependency` global.
:::

## `preloadSounds()`
Pass an array of sound ids (string) to be cached. This ensures that they will be ready once they are needed.

```ts
...
onInit() {
	Audio.preloadSounds(["id1", "id2", "id3"])
}
```

## `play()`
Play a sound. The sound will be cached to make future calls faster.

### Usage

```ts
...
onInit() {
	Audio.play("sound_id_here")
}
```

## `playUnique()`
Bypass the cache and play a sound directly. The sound will be destroyed once it's finished playing.
```ts
...
onInit() {
	Audio.playUnique("sound_id_here")
}
```