import { CometView } from "..";
import { Dependency, InternalSystem } from "../core";
import { CometState } from "../types/comet";
import { GUI } from "./gui";

const ContentProvider = game.GetService("ContentProvider");

/**
 * A system that contains tools for playing audio in studio.
 *
 * **You should never instantiate this class!** Instead, import it via the
 * `Dependency()` method within a constructor
 */
@InternalSystem()
export class Audio {
	private soundContainer: CometView;
	private soundCache: Map<string, Sound>;

	constructor(private state: CometState) {
		const gui = Dependency(GUI);

		this.soundCache = new Map();
		this.soundContainer = gui.createWidget(
			`${state.appName}_sfx`,
			Vector2.zero,
			Vector2.zero
		);
	}

	/**
	 * Prewarm the provided sound IDs to ensure flawless playback.
	 * @param ids
	 */
	public async preloadSounds(ids: string[]) {
		const sounds = ids.map((v) => this.cache(v));
		ContentProvider.PreloadAsync(sounds);
	}

	/**
	 * Play a sound. If a sound is currently playing, it will be restarted.
	 * @param id
	 * @param looped
	 */
	public play(id: string, looped = false) {
		const sound = this.cache(id);
		sound.Looped = looped;
		sound.Play();
	}

	/**
	 * Play a sound by bypassing the cache. Will destroy the sound instance once it has finished playing.
	 * @param id
	 * @param looped
	 */
	public playUnique(id: string, looped = false): Sound {
		const sound = this.createSound(id);
		sound.Looped = looped;
		sound.Play();

		this.state.tracker.handle(
			task.delay(sound.TimeLength, () => {
				sound?.Destroy();
			})
		);

		return sound;
	}

	/**
	 * Create a sound from scratch.
	 * @param id
	 * @returns
	 */
	private createSound(id: string): Sound {
		const sound = new Instance("Sound");
		sound.Parent = this.soundContainer.container;
		sound.SoundId = id;

		this.state.tracker.handle(sound);
		return sound;
	}

	/**
	 * Create or return a sound.
	 * @param id
	 * @returns
	 */
	private cache(id: string): Sound {
		if (this.soundCache.has(id)) {
			return this.soundCache.get(id)!;
		}

		const sound = this.createSound(id);
		this.soundCache.set(id, sound);
		return sound;
	}
}
