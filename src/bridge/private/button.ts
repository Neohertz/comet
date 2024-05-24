import { Networking } from "../networking";
import { BridgeState } from "../state";

/**
 * Toolbar button instance with many great features.
 */
export class Button {
	private button: PluginToolbarButton;
	private state: boolean;

	private toggleable: boolean;
	private clickEvent: Networking.Event;

	constructor(text: string, toolTip: string, image: string, toggleable: boolean) {
		if (!BridgeState.toolbar) {
			BridgeState.toolbar = BridgeState.plugin.CreateToolbar(BridgeState.name);
		}

		this.clickEvent = Networking.Event();

		this.button = BridgeState.toolbar.CreateButton(text, toolTip, image);
		this.toggleable = toggleable;
		this.state = false;

		BridgeState.janitor.Add(
			this.button.Click.Connect(() => {
				if (this.toggleable) {
					this.state = !this.state;
				}

				this.button.SetActive(this.state);
				this.button.Enabled = !this.button.Enabled;
				this.button.Enabled = true;

				this.clickEvent.fire();
			}),
		);
	}

	/**
	 * Set the button's press state (visually)
	 * @param state
	 */
	setPressed(state: boolean) {
		this.state = state;
		this.button.SetActive(this.state);
		this.button.Enabled = !this.button.Enabled;
		this.button.Enabled = true;
	}

	/**
	 * Listen to button presses on this toolbar button.
	 * @param cb State of button (if toggleable)
	 */
	onPress(cb: (state: boolean) => void) {
		this.clickEvent.connect(() => {
			cb(this.state);
		});

		return this;
	}
}
