import { HttpService } from "@rbxts/services";
import { Button } from "./button";
import { CometState } from "../state";
import { Networking } from "../networking";

/**
 * A view is a container for GUI elements.
 */
export class View {
	readonly container: DockWidgetPluginGui | ScreenGui;
	private onCloseBind: Networking.Event;

	/**
	 * Create a window that renders on the viewport.
	 * @param app
	 * @param name
	 */
	constructor(name: string);
	/**
	 * Create a window that renders in a widget.
	 * @param name
	 * @param size
	 * @param maxSize
	 */
	constructor(name: string, size: Vector2, maxSize: Vector2, dockState?: Enum.InitialDockState);
	constructor(name: string, size?: Vector2, maxSize?: Vector2, dockState = Enum.InitialDockState.Float) {
		assert(!CometState.windows.has(name), "[Comet] Detected multiple windows with the same name.");

		this.onCloseBind = Networking.Event();

		// If both size and maxSize are given, we know we are creating a dock widget.
		if (size && maxSize) {
			this.container = CometState.plugin.CreateDockWidgetPluginGui(
				HttpService.GenerateGUID(),
				new DockWidgetPluginGuiInfo(dockState, false, true, size.X, size.Y, maxSize.X, maxSize.Y),
			);

			(this.container as DockWidgetPluginGui).Title = name;
			this.container.BindToClose(() => this.onCloseBind.fire());
		} else {
			this.container = new Instance("ScreenGui", game.GetService("CoreGui"));
			this.container.IgnoreGuiInset = true;
			this.container.Enabled = false;
			CometState.janitor.Add(this.container);
		}
	}

	/**
	 * Callback will be invoked whenever the window closes.
	 * @param cb
	 */
	onClose(cb: () => void) {
		this.onCloseBind.connect(cb);
	}

	/**
	 * Fired whenever the window opens.
	 * @param cb
	 */
	onOpen(cb: () => void) {}

	/**
	 * Set visibility of the window.
	 * @param state boolean
	 */
	setVisible(state: boolean) {
		if (this.container) {
			this.container.Enabled = state;
		}
	}

	/**
	 * Link a toolbar button to the view so that the button's state controls the view's visibility and vice-versa.
	 * @param button Button
	 */
	linkButton(button: Button) {
		this.onCloseBind.connect(() => button.setPressed(false));
		button.onPress((state) => this.setVisible(state));
	}

	/**
	 * If the viewport is enabled, it will return its size.
	 * @returns Vector2
	 */
	getViewportSize(): Vector2 {
		return this.container.AbsoluteSize;
	}

	/**
	 * Mount a GuiBase instance to the window.
	 *
	 * Keep in mind that this method does not clone the instance.
	 * @param element `GuiBase`
	 * @returns element
	 */
	mount<T extends GuiBase>(element: T): T;
	/**
	 * Custom mounting method. Used to integrate ui-libraries like react and fusion.
	 * @param method (root: Instance) => (() => void)
	 */
	mount<T extends GuiBase>(method: (root: Instance) => () => void): void;
	mount<T extends GuiBase>(element: T | ((root: Instance) => () => void)) {
		assert(this.container, "Container instance is nill. This is most likely a bug.");

		if (typeIs(element, "function")) {
			const cb = element(this.container);
			CometState.janitor.Add(cb, true);
		} else {
			(element as GuiBase).Parent = this.container;
			CometState.janitor.Add(element);
			return element;
		}
	}

	/**
	 * Only to be called internally.
	 */
	destroy() {
		this.container?.Destroy();
	}
}
