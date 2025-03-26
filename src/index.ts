import { GUI } from "./systems/gui";
import { History } from "./systems/history";
import { Meta } from "./systems/meta";
import { Objects } from "./systems/objects";

export { Menu as CometMenu } from "./modules/menu";
export { View as CometView } from "./modules/view";
export { Action as CometAction } from "./modules/action";
export { Button as CometButton } from "./modules/button";

export { Comet, Dependency, System } from "./core";

/**
 * Comet's internal library of systems.
 */
export const Library = {
	GUI,
	Objects,
	Meta,
	History
};

export type { OnEnd, OnHeartbeat, OnInit, OnRender, OnStart } from "./types/lifecycle";
