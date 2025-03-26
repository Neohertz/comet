import { ERROR } from "../util/errors";
import { CometState } from "./../types/comet.d";
/**
 * This class utilizes builder functions to easily construct context menus.
 */
export class Action {
	private action: PluginAction;

	constructor(
		private state: CometState,
		id: string,
		name: string,
		statusTip: string,
		icon?: string,
		allowBinding?: boolean,
	) {
		assert(state.appPlugin, ERROR.APP_NOT_CREATED);

		this.action = state.appPlugin.CreatePluginAction(id, name, statusTip, icon, allowBinding);
		state.tracker.handle(() => this.cleanup());
	}

	private cleanup() {
		this.action.Destroy();
	}

	/**
	 * Add a callback for when the action is triggered.
	 * @param cb
	 */
	onTrigger(cb: () => void) {
		this.state.tracker.handle(this.action.Triggered.Connect(cb));
	}
}
