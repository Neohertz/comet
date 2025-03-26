# Comet v2.0

A fast plugin framework inspired by flamework.

## Example Usage:

```ts
// src/systems/main-system.ts
import {
  CometButton,
  Dependency,
  Library,
  OnEnd,
  OnInit,
  System,
} from "@rbxts/comet";
import { ServerStorage } from "@rbxts/services";

@System()
export class MySystem implements OnInit, OnEnd {
  public noteButton: CometButton;

  constructor(
    private gui = Dependency(Library.GUI),
    private meta = Dependency(Library.Meta),
    private objects = Dependency(Library.Objects)
  ) {
    this.noteButton = gui.createButton(
      "Create Note",
      "",
      "rbxassetid://7414445494",
      false,
      true
    );
  }

  public writeNote() {
    const newScript = new Instance("Script", ServerStorage);
    newScript.Name = "Note";
    this.objects.track(newScript); // Clean it up on unload.

    // Get the plugin reference at any time.
    const plugin = this.meta.getPlugin();
    plugin.OpenScript(newScript);
  }

  onInit() {
    // Do something when the button is
    this.noteButton.onPress(() => {
      this.writeNote();
    });
  }

  onEnd(): void {
    print("Plugin unloaded.");
  }
}
```

```ts
// src/init.server.ts
import { Comet } from "@rbxts/comet";

Comet.createApp("My awesome plugin!");
Comet.addPaths(script.Parent.Systems);
Comet.launch();
```

To learn more, visit the [Docs](https://neohertz.dev/docs/comet/about)
