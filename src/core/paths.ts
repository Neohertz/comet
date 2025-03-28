import { ERROR } from "../util/errors";
import { doesImplement } from "../util/guards";

export function addSystemPath(path?: Instance, recursive?: boolean) {
	assert(path !== undefined, ERROR.INVALID_PATH);

	const tsImpl = (_G as Map<unknown, unknown>).get(script) as object;

	const loadModule = doesImplement<{
		import: (a: LuaSourceContainer, b: LuaSourceContainer) => void;
	}>(tsImpl, "import")
		? (obj: ModuleScript) => tsImpl.import(script, obj)
		: require;

	const pool = recursive ? path.GetDescendants() : path.GetChildren();
	for (const obj of pool) {
		if (obj.IsA("ModuleScript")) {
			loadModule(obj);
		}
	}
}
