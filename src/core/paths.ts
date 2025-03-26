import { doesImplement } from "../util/guards";

export function addSystemPath(path: unknown) {
	const tsImpl = (_G as Map<unknown, unknown>).get(script) as object;

	const loadModule = doesImplement<{
		import: (a: LuaSourceContainer, b: LuaSourceContainer) => void;
	}>(tsImpl, "import")
		? (obj: ModuleScript) => tsImpl.import(script, obj)
		: require;

	for (const obj of (path as Instance).GetDescendants()) {
		if (obj.IsA("ModuleScript")) {
			loadModule(obj);
		}
	}
}
