import { Networking } from "../networking";
import { CometState } from "../state";

/**
 * Toolbar button instance with many great features.
 */
export class Button {
	private button: PluginToolbarButton;
	private state: boolean;

	private toggleable: boolean;
	private clickEvent: Networking.Event;

	constructor(text: string, toolTip: string, image: string, toggleable = true) {
		if (!CometState.toolbar) {
			CometState.toolbar = CometState.plugin.CreateToolbar(CometState.name);
		}

		this.clickEvent = Networking.Event();

		this.button = CometState.toolbar.CreateButton(text, toolTip, image);
		this.toggleable = toggleable;
		this.state = false;

		CometState.janitor.Add(
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
