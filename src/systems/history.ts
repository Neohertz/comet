import { InternalSystem } from "../core";
import { Log } from "../util/log";

/**
 * An internal service for all things history related.
 */

const ChangeHistoryService = game.GetService("ChangeHistoryService");

@InternalSystem()
export class History {
	private lastRecording: string | undefined;

	constructor() {}

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
		let recording = ChangeHistoryService.TryBeginRecording(name, description);

		if (recording === undefined) {
			Log.warn(
				`Recording '${this.lastRecording}' has been canceled because a new one was started. Refactor your code to ensure the recording is always handled properly.`
			);
			ChangeHistoryService.FinishRecording("", Enum.FinishRecordingOperation.Cancel, undefined);
			this.lastRecording = undefined;
			recording = ChangeHistoryService.TryBeginRecording(name, description);
		}

		this.lastRecording = recording;

		// NOTE: returning an object here as a class would be a bit unnecessary. This may change as it's not very uniform.
		return {
			/**
			 * Commits the recorded work to the history.
			 * @param options
			 */
			commit: (options?: object) => {
				ChangeHistoryService.FinishRecording(recording!, Enum.FinishRecordingOperation.Commit, options);
			},

			/**
			 * Commits the recorded work and merges with the previous recording if possible.
			 * @param options
			 */
			append: (options?: object) => {
				ChangeHistoryService.FinishRecording(recording!, Enum.FinishRecordingOperation.Append, options);
			},

			/**
			 * Cancel the recording, undoing any changes made.
			 * @param options
			 */
			cancel: (options?: object) => {
				ChangeHistoryService.FinishRecording(recording!, Enum.FinishRecordingOperation.Cancel, options);
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
