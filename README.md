# Comet v2.0

A modular, singleton based framework for building plugins for Roblox Studio.

## What's new in v2.0?
Comet has been rewritten from scratch to improve the developer experience.

- Proper dependencies and load order resolution.
- Utilities are now modules. No more messy classes.
- Added `onHeartbeat` lifecycle method.
- Systems are declared via `@System` decorator.

## Example Usage:
A simple plugin that allows you to create a note by clicking the ribbon button.
```ts
// src/systems/main-system.ts
import { Audio, Button, Dependency, GUI, OnEnd, OnInit, System, View } from "@rbxts/comet";
import { ExampleSystem } from "systems/example";
import { mountReactTree } from "tree";

@System()
export class MainSystem implements OnInit, OnEnd {
  public openButton: Button;
  public widget: View;

  constructor(
    // Request comet's internal systems.
    public audio = Dependency(Audio),
    public gui = Dependency(GUI),
    // Request user's systems.
    public example = Dependency(ExampleSystem)
  ) {
    this.openButton = gui.createButton(
      "Open",
      "Open the plugin's GUI.",
      "rbxassetid://7414445494"
    );
    this.widget = gui.createWidget(
      "My App",
      new Vector2(500, 500),
      Vector2.zero,
      Enum.InitialDockState.Left
    );
  }

  onInit(): void {
    /** 
     * Since we have ExampleSystem as a dependency, it will
     * initialize first.
     */ 
    print(this.example.message); // "Hello, World!"

    // Link the button's state to the view's visibility.
    this.widget.linkButton(this.openButton);

    // Play a sound on click via the internal audio system.
    this.openButton.onPress(() => {
      this.audio.play("rbxassetid://15675032796");
    });

    /**
     * Quickly mount a UI framework of your choice.
     * 
     * Tip: Pass the system down to a context to easily 
     * access your plugin logic from components!
     */
    this.widget.mount((parent) => {
      return mountReactTree(parent, this);
    });
  }

  onEnd(): void {
    print("Plugin has unloaded.");
  }
}
```

```ts
// src/systems/example.ts
import { OnInit, System } from "@rbxts/comet";

@System()
export class ExampleSystem implements OnInit {
  public message?: string;

  onInit(): void {
    print("Example system initialized!");
    this.message = "Hello, World!";
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
