import { InternalSystem } from "../core";
import { CometState } from "../types/comet";
import { TrackableObject } from "../util/tracker";

const SelectionService = game.GetService("Selection");

@InternalSystem()
export class Objects {
	constructor(private state: CometState) {}

	/**
	 * Track an object or instance. Will be cleaned up when the plugin unloads.
	 * @param object
	 */
	public track(object: TrackableObject) {
		this.state.tracker.handle(object);
	}

	/**
	 * Returns an array of the currently selected items.
	 * @returns Instance[]
	 */
	public getSelection(): Instance[] {
		return SelectionService.Get();
	}

	/**
	 * Select instances.
	 * If no items are supplied to this function, it will deselect all
	 * @param obj? Instance | Instance[]
	 */
	public select(obj?: Instance | Instance[]) {
		game.GetService("Selection").Set(obj ? (typeIs(obj, "table") ? (obj as Instance[]) : [obj]) : []);
	}

	/**
	 * Bind a callback to selection changes.
	 * @param fn
	 */
	public onSelectionChanged(fn: (selection: Instance[]) => void) {
		this.state.tracker.handle(
			SelectionService.SelectionChanged.Connect(() => {
				fn(this.getSelection());
			})
		);
	}
}
