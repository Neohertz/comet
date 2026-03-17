export type TrackableObject =
	| Instance
	| RBXScriptConnection
	| thread
	| Callback;

export class Tracker {
	private store = new Array<TrackableObject>();

	public handle<T extends Array<TrackableObject>>(...objects: T) {
		objects.move(0, objects.size() - 1, this.store.size(), this.store);
	}

	public clean() {
		for (const obj of this.store) {
			if (typeIs(obj, "Instance")) {
				obj?.Destroy();
			} else if (typeIs(obj, "RBXScriptConnection")) {
				obj?.Disconnect();
			} else if (typeIs(obj, "thread")) {
				task?.cancel(obj);
			} else if (typeIs(obj, "function")) {
				obj?.();
			}
		}
	}
}
