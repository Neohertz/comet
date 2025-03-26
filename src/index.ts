import { Comet } from "./core";

export { Menu as CometMenu } from "./modules/menu";
export { View as CometView } from "./modules/view";
export { Action as CometAction } from "./modules/action";
export { Button as CometButton } from "./modules/button";

export { Comet, Dependency, System } from "./core";
export * from "./systems";

export type { OnEnd, OnHeartbeat, OnInit, OnRender, OnStart } from "./types/lifecycle";

// Register internal systems.
Comet.addPaths(script.FindFirstChild("systems"));
