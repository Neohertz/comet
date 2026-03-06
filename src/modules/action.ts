import { CometError } from "../core/enum";
import { CometState } from "./../types/comet.d";
/**
 * This class utilizes builder functions to easily construct context menus.
 */
export class Action {
	private action: PluginAction;

	constructor(
		private readonly state: CometState,
		readonly id: string,
		readonly name: string,
		readonly statusTip: string,
		readonly icon?: string,
		readonly allowBinding?: boolean
	) {
		assert(state.appPlugin, CometError.APP_NOT_CREATED);

		this.action = state.appPlugin.CreatePluginAction(
			id,
			name,
			statusTip,
			icon,
			allowBinding
		);
		state.tracker.handle(() => this.cleanup());
	}

	/**
	 * Add a callback for when the action is triggered.
	 * @param cb
	 */
	public onTrigger(cb: () => void) {
		this.state.tracker.handle(this.action.Triggered.Connect(cb));
	}

	private cleanup() {
		this.action.Destroy();
	}
}
