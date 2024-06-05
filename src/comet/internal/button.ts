import { Networking } from "../networking";
import { State } from "../state";

/**
 * Toolbar button instance with many great features.
 */
export class Button {
	private button: PluginToolbarButton;
	private state: boolean;

	private toggleable: boolean;
	private clickEvent: Networking.Event;

	constructor(text: string, toolTip: string, image: string, toggleable = true, enabledOutsideViewport = false) {
		if (!State.toolbar) {
			State.toolbar = State.plugin.CreateToolbar(State.name);
		}

		this.clickEvent = Networking.Event();

		this.button = State.toolbar.CreateButton(text, toolTip, image);
		this.button.ClickableWhenViewportHidden = enabledOutsideViewport;
		this.toggleable = toggleable;
		this.state = false;

		State.maid.Add(
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
	 * Set the button's disabled state.
	 * @param state
	 */
	setEnabled(state: boolean) {
		this.button.Enabled = state;
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
