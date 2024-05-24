import { App } from "../app";

/**
 * Toolbar button instance with many great features.
 */
export class ToolbarButton {
	private button: PluginToolbarButton;
	private state: boolean;

	private toggleable: boolean;

	constructor(text: string, toolTip: string, image: string, toggleable: boolean) {
		if (!App.toolbar) {
			App.toolbar = App.plugin.CreateToolbar(App.name);
		}

		this.button = App.toolbar.CreateButton(text, toolTip, image);
		this.toggleable = toggleable;
		this.state = false;
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
		App.janitor.Add(
			this.button.Click.Connect(() => {
				if (this.toggleable) {
					this.state = !this.state;
				}

				this.button.SetActive(this.state);
				this.button.Enabled = !this.button.Enabled;
				this.button.Enabled = true;

				cb(this.state);
			}),
		);

		return this;
	}
}
