import { ContentProvider } from "@rbxts/services";
import { View } from "./view";
import { State } from "../state";

export class SFX {
	// HACK: roblox requires sounds to be within a widget in edit mode.
	static soundWidget: View;

	private soundMap: Map<string, Sound>;

	constructor() {
		this.soundMap = new Map();
		SFX.soundWidget ??= new View("", Vector2.zero, Vector2.zero);
	}

	/**
	 * Play a sound within your plugin.
	 * @param soundId
	 * @param looped
	 */
	async playSound(soundId: string | number, looped = false) {
		if (typeIs(soundId, "number")) {
			soundId = `rbxassetid://${soundId}`;
		}

		let sound = this.soundMap.get(soundId);

		if (sound) {
			sound.Play();
			return;
		}

		sound = new Instance("Sound", SFX.soundWidget.container);
		sound.SoundId = soundId;
		sound.Looped = looped;
		State.maid.Add(sound);
		this.soundMap.set(soundId, sound);

		ContentProvider.PreloadAsync([sound]);
		sound.Play();
	}
}
