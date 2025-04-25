import { CometState } from "../types/comet";
import { CometError } from "../core/enum";
import Signal from "@rbxts/lemon-signal";
import { Button } from "./button";
import { Logger } from "../util/logger";

const HttpService = game.GetService("HttpService");

/**
 * A view is a container for GUI elements.
 */
export class View {
	readonly container: DockWidgetPluginGui | ScreenGui;
	private onCloseBind: Signal;

	/**
	 * Create a window that renders on the viewport.
	 * @param app
	 * @param name
	 */
	constructor(state: CometState, name: string);
	/**
	 * Create a window that renders in a widget.
	 * @param name
	 * @param size
	 * @param minSize
	 */
	constructor(
		state: CometState,
		name: string,
		size: Vector2,
		minSize: Vector2,
		dockState?: Enum.InitialDockState
	);
	constructor(
		private state: CometState,
		name: string,
		size?: Vector2,
		minSize?: Vector2,
		dockState = Enum.InitialDockState.Float
	) {
		assert(
			!state.windows.has(name),
			"[Comet] Detected multiple windows with the same name."
		);
		assert(state.appPlugin, CometError.APP_NOT_CREATED);

		this.onCloseBind = new Signal();

		// If both size and maxSize are given, we know we are creating a dock widget.
		if (size && minSize) {
			this.container = state.appPlugin.CreateDockWidgetPluginGui(
				HttpService.GenerateGUID(),
				new DockWidgetPluginGuiInfo(
					dockState,
					false,
					true,
					size.X,
					size.Y,
					minSize.X,
					minSize.Y
				)
			);

			(this.container as DockWidgetPluginGui).Title = name;
			this.container.BindToClose(() => this.onCloseBind.Fire());
		} else {
			this.container = new Instance(
				"ScreenGui",
				game.GetService("CoreGui")
			);
			this.container.IgnoreGuiInset = true;
			this.container.Enabled = false;
			state.tracker.handle(this.container);
		}
	}

	/**
	 * Callback will be invoked whenever the window closes.
	 * @param cb
	 */
	onClose(cb: () => void) {
		this.onCloseBind.Connect(cb);
	}

	/**
	 * Fired whenever the window opens.
	 * @param cb
	 */
	onOpen(cb: () => void) {
		Logger.warn("OnOpen is not implemented.");
	}

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
		this.onCloseBind.Connect(() => button.setPressed(false));
		button.onPress((state) => this.setVisible(state));
	}

	/**
	 * Returns the viewport size, but only will only function as expected in viewport mode.
	 * @returns Vector2
	 */
	getViewportSize(): Vector2 {
		return this.container.AbsoluteSize;
	}

	/**
	 * Mount a GuiBase instance to the window.
	 * The `createCopy` parameter defaults to false, but if true it will copy it before re-parenting.
	 * @param element `GuiBase`
	 * @param createCopy boolean
	 * @returns element
	 */
	mount<T extends GuiBase>(element: T, createCopy?: boolean): T;
	/**
	 * Custom mounting method. Used to integrate ui-libraries like react and fusion.
	 * @param method (root: Instance) => (() => void)
	 */
	mount<T extends GuiBase>(method: (root: Instance) => () => void): void;
	mount<T extends GuiBase>(
		element: T | ((root: Instance) => () => void),
		createCopy = false
	) {
		assert(
			this.container,
			"Container instance is nill. This is most likely a bug."
		);

		if (typeIs(element, "function")) {
			const cb = element(this.container);
			this.state.tracker.handle(() => cb());
		} else {
			if (createCopy) element = element.Clone();
			(element as GuiBase).Parent = this.container;
			this.state.tracker.handle(element);
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
