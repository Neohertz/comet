export type TrackableObject =
	| Instance
	| RBXScriptConnection
	| thread
	| Callback;

export class Tracker {
	private store = new Array<TrackableObject>();

	public handle<T extends TrackableObject>(object: T) {
		this.store.push(object);
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
