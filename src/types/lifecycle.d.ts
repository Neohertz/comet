/**
 * | Lifecycle Methods
 */

export interface OnInit {
	/**
	 * Called synchronously when the system starts.
	 * @returns void
	 *
	 * @hidden
	 */
	onInit(): void;
}

export interface OnStart {
	/**
	 * Called asynchronously after the system initializes.
	 * @returns void
	 *
	 * @hidden
	 */
	onStart(): void | Promise<void>;
}

export interface OnEnd {
	/**
	 * Called when the plugin is unloaded.
	 * @returns void
	 *
	 * @hidden
	 */
	onEnd(): void;
}

export interface OnRender {
	/**
	 * Called each frame using `RenderStepped`.
	 * @returns void
	 *
	 * @hidden
	 */
	onRender(dt: number): void;
}

export interface OnHeartbeat {
	/**
	 * Called on server heartbeat.
	 * @returns void
	 *
	 * @hidden
	 */
	onHeartbeat(dt: number): void;
}
