import { Janitor } from "@rbxts/janitor";
import { View } from "./internal/view";
import { System } from ".";

export namespace State {
	export const systems = new Map<string, System>();
	export const windows = new Map<string, View>();
	export const maid = new Janitor();

	export let toolbar: PluginToolbar | undefined = undefined;
	export let initialized: boolean = false;
	export let launched: boolean = false;
	export let plugin: Plugin;
	export let name: string;

	export let runInPlaytestEnabled: boolean = false;
	export let debugEnabled: boolean = false;

	export function log(method: (val: string) => void, val: string) {
		method(`[Comet] ${val}`);
	}
}
