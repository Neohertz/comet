import { HttpService } from "@rbxts/services";
import { App } from "../app";
import { ToolbarButton } from "./toolbarButton";
import { Bind } from "./bind";

/**
 * A view is a container for GUI elements.
 */
export class View {
	private container: DockWidgetPluginGui | ScreenGui;
	private onCloseBind: Bind<[]>;

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
		assert(App.getWindow(name) === undefined, "[Bridge] Detected multiple windows with the same name.");
		this.onCloseBind = new Bind();

		// If both size and maxSize are given, we know we are creating a dock widget.
		if (size && maxSize) {
			this.container = App.plugin.CreateDockWidgetPluginGui(
				HttpService.GenerateGUID(),
				new DockWidgetPluginGuiInfo(dockState, false, true, size.X, size.Y, maxSize.X, maxSize.Y),
			);

			(this.container as DockWidgetPluginGui).Title = name;
			this.container.BindToClose(() => this.onCloseBind.fire());
		} else {
			this.container = new Instance("ScreenGui", game.GetService("CoreGui"));
			this.container.IgnoreGuiInset = true;
			this.container.Enabled = false;
			App.janitor.Add(this.container);
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
	linkButton(button: ToolbarButton) {
		this.onCloseBind.connect(() => button.setPressed(false));
		button.onPress((state) => this.setVisible(state));
	}

	/**
	 * If the viewport is enabled, it will return its size.
	 * @returns Vector2
	 */
	getViewportSize(): Vector2 | undefined {
		if (this.container.Enabled) return this.container.AbsoluteSize;
	}

	/**
	 * Mount a GuiBase instance to the window.
	 * @param element `GuiBase`
	 */
	mount<T extends GuiBase>(element: T): void;
	/**
	 * Custom mounting method. Used to integrate ui-libraries like react and fusion.
	 * @param method (root: Instance) => (() => void)
	 */
	mount<T extends GuiBase>(method: (root: Instance) => () => void): void;
	mount<T extends GuiBase>(element: T | ((root: Instance) => () => void)) {
		assert(this.container, "Container instance is nill. This is most likely a bug.");

		if (typeIs(element, "function")) {
			const cb = element(this.container);
			App.janitor.Add(() => cb());
		} else {
			(element as GuiBase).Parent = this.container;
			App.janitor.Add(element);
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
