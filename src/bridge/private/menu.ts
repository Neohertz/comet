import { HttpService } from "@rbxts/services";
import { BridgeState } from "../state";

/**
 * This class utilizes builder functions to easily construct context menus.
 */
export class Menu {
	private rootMenu: PluginMenu;
	private currentMenu: PluginMenu;

	private menus: PluginMenu[];
	private actions: PluginAction[];

	constructor() {
		this.menus = new Array();
		this.actions = new Array();

		this.rootMenu = BridgeState.plugin.CreatePluginMenu(HttpService.GenerateGUID());
		this.currentMenu = this.rootMenu;

		this.menus.push(this.rootMenu);

		BridgeState.janitor.Add(() => this.cleanup());
	}

	private cleanup() {
		this.menus.forEach((e) => e.Destroy());
		this.actions.forEach((e) => e.Destroy());
	}

	/**
	 * Async function that shows context menu. Responses are handled in action declaration.
	 */
	async show() {
		this.rootMenu.ShowAsync();
	}

	/**
	 * Seperate Menu
	 */
	seperator() {
		this.currentMenu.AddSeparator();
		return this;
	}

	/**
	 * Define an action.
	 * @param title
	 * @param icon
	 * @param cb
	 * @returns
	 */
	action(title: string, icon?: string, cb?: () => void) {
		const action = this.currentMenu.AddNewAction(HttpService.GenerateGUID(), title, icon);
		BridgeState.janitor.Add(action);
		BridgeState.janitor.Add(action.Triggered.Connect(() => cb?.()));
		return this;
	}

	/**
	 * Creates and selects a submenu in the builder.
	 * @param title
	 * @param icon
	 */
	submenu(title?: string, icon?: string) {
		const menu = BridgeState.plugin.CreatePluginMenu(HttpService.GenerateGUID(), title, icon);
		menu.Title = title ?? "";
		this.currentMenu.AddMenu(menu);
		this.currentMenu = menu;
		this.menus.push(this.currentMenu);
		return this;
	}

	/**
	 * Selects the root menu. Useful for adding top-level context menu items after a submenu.
	 */
	root() {
		this.currentMenu = this.rootMenu;
		return this;
	}
}
