import { InternalSystem } from "../core";
import { Button } from "../modules/button";
import { Menu } from "../modules/menu";
import { View } from "../modules/view";
import { CometState } from "../types/comet";

@InternalSystem()
export class GUI {
	constructor(private state: CometState) {}

	/**
	 * Create a view that exists in a widget.
	 * @param name
	 * @param size
	 * @param minSize
	 * @param dockState
	 * @returns View
	 */
	public createWidget(name: string, size: Vector2, minSize: Vector2, dockState?: Enum.InitialDockState) {
		return new View(this.state, name, size, minSize, dockState);
	}

	/**
	 * Create a view that overlays the viewport.
	 * @param name
	 * @returns View
	 */
	public createOverlay(name: string) {
		return new View(this.state, name);
	}

	/**
	 * Build a menu that can be accessed at any time.
	 * @returns MenuBuilder
	 */
	public buildMenu() {
		return new Menu(this.state);
	}

	/**
	 * Create a toggle button on the plugin toolbar.
	 * @param text
	 * @param toolTip
	 * @param image
	 * @param toggleable
	 * @param enabledOutsideViewport
	 * @returns Button
	 */
	public createButton(
		text: string,
		toolTip: string,
		image: string,
		toggleable?: boolean,
		enabledOutsideViewport?: boolean
	) {
		return new Button(this.state, text, toolTip, image, toggleable, enabledOutsideViewport);
	}
}
