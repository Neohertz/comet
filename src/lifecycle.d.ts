export interface onInit {
	/**
	 * Called synchronously when the system starts.
	 */
	onInit(): void;
}

export interface onStart {
	/**
	 * Called asyncronously after the system initializes.
	 */
	onStart(): void | Promise<void>;
}

export interface onEnd {
	/**
	 * Called when the plugin is unloaded.
	 * @returns void
	 */
	onEnd(): void;
}

/**
 * Called each frame using `RenderStepped`.
 *
 * @hideInherited
 */
export interface onRender {
	onRender(dt: number): void;
}
