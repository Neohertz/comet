import { InternalSystem } from "../core";
import { CometState } from "../types/comet";
import { Logger } from "../util/logger";

const ChangeHistoryService = game.GetService("ChangeHistoryService");

interface RecordConfig {
	name: string;
	description?: string;
	onSuccess?: "commit" | "append" | "cancel";
}

/**
 * A system that contains utilities for managing undo/redo waypoints.
 *
 * **You should never instantiate this class!** Instead, import it via the
 * `Dependency()` method within a constructor
 */
@InternalSystem()
export class History {
	private lastRecording: string | undefined;

	constructor(private state: CometState) {}

	/**
	 * A pcall-like wrapper for `record()` that allows you to quickly try an operation and abort changes if it fails.
	 *
	 * @param config
	 * @param fn
	 * @returns value or error.
	 */
	public async try<T extends Callback>(
		name: string,
		fn: T,
		...args: Parameters<T>
	): Promise<ReturnType<T>>;
	/**
	 * A pcall-like wrapper for `record()` that allows you to quickly try an operation and abort changes if it fails.
	 *
	 * Within the configuration, you may choose the action that is taken upon successful execution.
	 * This will default to `commit`.
	 *
	 * @param config
	 * @param fn
	 * @returns value or error.
	 */
	public async try<T extends Callback>(
		config: RecordConfig,
		fn: T,
		...args: Parameters<T>
	): Promise<ReturnType<T>>;
	public async try<T extends Callback>(
		config: RecordConfig | string,
		fn: T,
		...args: Parameters<T>
	): Promise<ReturnType<T>> {
		if (typeIs(config, "string")) config = { name: config };
		config.onSuccess ??= "commit";

		const recording = this.record(config.name, config.description);
		const [success, result] = pcall(fn, ...(args as unknown[]));

		if (success) {
			recording[config.onSuccess]();
			return result;
		}

		recording.cancel();
		throw result;
	}

	/**
	 * API for recoding waypoints to undo/redo history.
	 *
	 * ```ts
	 * const waypoint = this.record("My waypoint!");
	 *
	 * // Do some logic
	 * const part = new Instance("Part", Workspace);
	 *
	 * if (part) waypoint.commit();
	 * else waypoint.cancel();
	 * ```
	 * @param name
	 * @param description
	 * @returns object
	 */
	public record(name: string, description?: string) {
		let recording = ChangeHistoryService.TryBeginRecording(
			name,
			description
		);

		if (recording === undefined) {
			Logger.warn(
				`Recording '${this.lastRecording}' has been canceled because a new one was started. Refactor your code to ensure the recording is always handled properly.`
			);
			ChangeHistoryService.FinishRecording(
				"",
				Enum.FinishRecordingOperation.Cancel,
				undefined
			);
			this.lastRecording = undefined;
			recording = ChangeHistoryService.TryBeginRecording(
				name,
				description
			);
		}

		this.lastRecording = recording;

		// NOTE: returning an object here as a class would be a bit unnecessary. This may change as it's not very uniform.
		return {
			/**
			 * Commits the recorded work to the history.
			 * @param options
			 */
			commit: (options?: object) => {
				ChangeHistoryService.FinishRecording(
					recording!,
					Enum.FinishRecordingOperation.Commit,
					options
				);
			},

			/**
			 * Commits the recorded work and merges with the previous recording if possible.
			 * @param options
			 */
			append: (options?: object) => {
				ChangeHistoryService.FinishRecording(
					recording!,
					Enum.FinishRecordingOperation.Append,
					options
				);
			},

			/**
			 * Cancel the recording, undoing any changes made.
			 * @param options
			 */
			cancel: (options?: object) => {
				ChangeHistoryService.FinishRecording(
					recording!,
					Enum.FinishRecordingOperation.Cancel,
					options
				);
			}
		};
	}

	/**
	 * Undo the last action.
	 */
	public undo() {
		ChangeHistoryService.Undo();
	}

	/**
	 * Redo the last action.
	 */
	public redo() {
		ChangeHistoryService.Redo();
	}
}
