import { HttpService } from "@rbxts/services";
import { State } from "../state";

/**
 * This class utilizes builder functions to easily construct context menus.
 */
export class Action {
	private action: PluginAction;

	constructor(name: string, statusTip: string, icon?: string, allowBinding?: boolean) {
		this.action = State.plugin.CreatePluginAction(HttpService.GenerateGUID(), name, statusTip, icon, allowBinding);
		State.maid.Add(() => this.cleanup());
	}

	private cleanup() {
		this.action.Destroy();
	}

	onTrigger(cb: () => void) {
		State.maid.Add(this.action.Triggered.Connect(cb));
	}
}
