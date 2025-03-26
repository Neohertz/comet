import Signal from "@rbxts/lemon-signal";
import { ERROR } from "../util/errors";
import { CometState } from "./../types/comet.d";

/**
 * Toolbar button instance with many great features.
 */
export class Button {
	private button: PluginToolbarButton;
	private buttonState: boolean;
	private toggleable: boolean;

	private clickEvent: Signal;

	constructor(
		private state: CometState,
		text: string,
		toolTip: string,
		image: string,
		toggleable = true,
		enabledOutsideViewport = false,
	) {
		assert(state.appPlugin, ERROR.APP_NOT_CREATED);

		if (!state.toolbar) {
			state.toolbar = state.appPlugin.CreateToolbar(state.appName);
		}

		//this.clickEvent = Networking.Event();

		this.button = state.toolbar.CreateButton(text, toolTip, image);
		this.button.ClickableWhenViewportHidden = enabledOutsideViewport;
		this.toggleable = toggleable;
		this.buttonState = false;
		this.clickEvent = new Signal();

		state.tracker.handle(
			this.button.Click.Connect(() => {
				if (this.toggleable) {
					this.buttonState = !this.buttonState;
				}

				this.button.SetActive(this.buttonState);
				this.button.Enabled = !this.button.Enabled;
				this.button.Enabled = true;

				this.clickEvent.Fire();
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
		this.buttonState = state;
		this.button.SetActive(this.buttonState);
		this.button.Enabled = !this.button.Enabled;
		this.button.Enabled = true;
		this.clickEvent.Fire();
	}

	/**
	 * Listen to button presses on this toolbar button.
	 * @param cb State of button (if toggleable)
	 */
	onPress(cb: (state: boolean) => void) {
		this.clickEvent.Connect(() => {
			cb(this.buttonState);
		});

		return this;
	}
}
