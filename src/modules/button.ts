import Signal from "@rbxts/lemon-signal";
import { CometError } from "../core/enum";
import { CometState } from "./../types/comet.d";

/**
 * Toolbar button instance with many great features.
 */
export class Button {
	private button: PluginToolbarButton;
	private buttonState: boolean;

	private clickEvent: Signal;

	constructor(
		readonly state: CometState,
		readonly text: string,
		readonly toolTip: string,
		readonly image: string,
		public readonly toggleable = true,
		readonly enabledOutsideViewport = false
	) {
		assert(state.appPlugin, CometError.APP_NOT_CREATED);

		if (!state.toolbar) {
			state.toolbar = state.appPlugin.CreateToolbar(state.appName);
		}

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
				this.clickEvent.Fire();
			})
		);
	}

	/**
	 * Set the button's disabled state.
	 * @param state
	 */
	public setEnabled(state: boolean) {
		this.button.Enabled = state;
	}

	/**
	 * Set the button's press state (visually)
	 * @param state
	 */
	public setPressed(state: boolean) {
		this.buttonState = state;
		this.button.SetActive(this.buttonState);
		this.clickEvent.Fire();
	}

	/**
	 * Listen to button presses on this toolbar button.
	 * @param cb State of button (if toggleable)
	 */
	public onPress(cb: (state: boolean) => void) {
		this.clickEvent.Connect(() => {
			cb(this.buttonState);
		});

		return this;
	}
}
