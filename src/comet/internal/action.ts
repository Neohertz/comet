import { State } from "../state";

/**
 * This class utilizes builder functions to easily construct context menus.
 */
export class Action {
	private action: PluginAction;

	constructor(id: string, name: string, statusTip: string, icon?: string, allowBinding?: boolean) {
		this.action = State.plugin.CreatePluginAction(id, name, statusTip, icon, allowBinding);
		State.maid.Add(() => this.cleanup());
	}

	private cleanup() {
		this.action.Destroy();
	}

	/**
	 * Add a callback for when the action is triggered.
	 * @param cb
	 */
	onTrigger(cb: () => void) {
		State.maid.Add(this.action.Triggered.Connect(cb));
	}
}
