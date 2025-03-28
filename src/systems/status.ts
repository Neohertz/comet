import { Dependency, InternalSystem } from "../core";
import { Logger } from "../util/logger";
import { CometState } from "../types/comet";
import { History } from "./history";

type PermissionType = "ScriptInjection" | "Http";
const Http = game.GetService("HttpService");

/**
 * A system for checking the status of the plugin host, including requesting permissions and network status.
 *
 * **You should never instantiate this class!** Instead, import it via the
 * `Dependency()` method within a constructor
 */
@InternalSystem()
export class Status {
	private history = Dependency(History);

	private isHostOnline: boolean | undefined;

	/**
	 * Url used for testing network connection.
	 * You can change this to whatever youd like.
	 *
	 * Default: `https://www.google.com`
	 */
	public url = "https://www.google.com";

	constructor(private state: CometState) {}

	/**
	 * Check to see if the plugin's host computer is online.
	 *
	 * This method is cached to reduce calls. You can bypass this with the `force` parameter.
	 *
	 * @param force boolean
	 * @returns
	 */
	public async isOnline(force?: boolean) {
		if (!force && this.isHostOnline !== undefined) return this.isHostOnline;
		return this.tryHttpRequest();
	}

	/**
	 * Check to see if the plugin has a set of permissions.
	 *
	 * Returns a tuple, where [0] is the status. If the status is
	 * false, the **first** missing permission will be returned as the
	 * second item in the tuple.
	 * @param types
	 */
	public hasPermissions(
		...types: PermissionType[]
	): LuaTuple<[boolean, PermissionType?]> {
		const attempt = (permType: PermissionType) => {
			switch (permType) {
				case "ScriptInjection":
					return this.tryInjectScripts();
				case "Http":
					return this.tryHttpRequest();
			}
		};

		for (const permission of types) {
			if (attempt(permission) === false) return $tuple(false, permission);
		}

		return $tuple(true, undefined);
	}

	/**
	 * Try creating a script to see if we have injection permissions.
	 * @returns
	 */
	private tryInjectScripts() {
		const [success] = this.history
			.try({ name: "Try Injecting Scripts", onSuccess: "cancel" }, () => {
				return new Instance("Script", game.GetService("CoreGui"));
			})
			.await();

		return success;
	}

	/**
	 * Ping a website (google.com)
	 * @returns
	 */
	private tryHttpRequest() {
		const [success, err] = pcall(() =>
			Http.RequestAsync({
				Url: this.url,
				Method: "HEAD"
			})
		);

		if (!success) Logger.warn(`Request to ${this.url} failed: ${err}`);

		this.isHostOnline = success;
		return success;
	}
}
