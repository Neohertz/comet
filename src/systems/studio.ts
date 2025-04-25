import { InternalSystem } from "../core";
import { Action } from "../modules/action";
import { CometState } from "../types/comet";

const SelectionService = game.GetService("Selection");

type OfUnion<T extends { id: AssetTypeId; name: string }> = {
	[P in T["name"]]: Extract<T, { id: P }>;
};

const insertService = game.GetService("InsertService");

/**
 * A system that contains helpful wrappers for studio plugin features.
 * Most methods are wrappers with stronger typings than the original.
 *
 * **You should never instantiate this class!** Instead, import it via the
 * `Dependency()` method within a constructor
 */
@InternalSystem()
export class Studio {
	/**
	 * Access the plugin global.
	 */
	public plugin: Plugin;

	constructor(private state: CometState) {
		this.plugin = state.appPlugin;
	}

	/**
	 * Create a plugin action.
	 * @param id
	 * @param name
	 * @param statusTip
	 * @param icon
	 * @param allowBinding
	 * @returns
	 */
	public createAction(
		id: string,
		name: string,
		statusTip: string,
		icon?: string,
		allowBinding?: boolean
	) {
		return new Action(this.state, id, name, statusTip, icon, allowBinding);
	}

	/**
	 * Select a ribbon tool
	 * @param button
	 * @param position
	 */
	public selectTool(
		button: Enum.RibbonTool,
		position = UDim2.fromScale(0.5, 0.5)
	) {
		this.plugin.SelectRibbonTool(button, position);
	}

	/**
	 * Attempt to save the selected items to either local storage or the cloud.
	 *
	 * Will return a boolean if the operation was successful. **Will only yield when saving locally**.
	 *
	 * @returns boolean
	 */
	public async saveSelection(
		saveLocally: boolean,
		suggestedFileName?: string
	): Promise<boolean> {
		if (this.getSelection().size() < 1) return false;

		if (saveLocally) {
			this.plugin.SaveSelectedToRoblox();
			return true;
		}

		return this.plugin.PromptSaveSelection(suggestedFileName);
	}

	/**
	 * Prompt the user for an asset ID of a given type.
	 *
	 * This method will inevitably error if the asset type isn't supported by roblox.
	 */
	public async requestAssetId(assetType: keyof OfUnion<AssetType>) {
		return this.plugin.PromptForExistingAssetId(assetType);
	}

	/**
	 * Open a script to a given line. Will return the provided script.
	 */
	public openScript<T extends LuaSourceContainer>(
		source: T,
		lineNumber?: number
	): T {
		this.plugin.OpenScript(source, lineNumber);
		return source;
	}

	/**
	 * Returns an array of the currently selected items.
	 * @returns Instance[]
	 */
	public getSelection(): Instance[] {
		return SelectionService.Get();
	}

	/**
	 * Select instances.
	 * If no items are supplied to this function, it will deselect all
	 * @param obj? Instance | Instance[]
	 */
	public select(obj?: Instance | Instance[]) {
		game.GetService("Selection").Set(
			obj ? (typeIs(obj, "table") ? (obj as Instance[]) : [obj]) : []
		);
	}

	/**
	 * Bind a callback to selection changes.
	 * @param fn
	 */
	public onSelectionChanged(fn: (selection: Instance[]) => void) {
		this.state.tracker.handle(
			SelectionService.SelectionChanged.Connect(() => {
				fn(this.getSelection());
			})
		);
	}
}
