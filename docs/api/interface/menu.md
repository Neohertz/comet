# Menu
> Related: [GUI](/api/modules/gui)

`Menu` is a small builder for `PluginMenu` trees.

## Builder methods

- `action(title, icon?, cb?)` adds an item to the current menu and returns the builder.
- `separator()` adds a separator to the current menu and returns the builder.
- `submenu(title?, icon?)` creates a submenu, selects it as the current target, and returns the builder.
- `root()` switches back to the top-level menu and returns the builder.
- `show()` opens the menu asynchronously.

## Usage
```ts
const menu = gui
    .buildMenu()
    .action("Select everything", undefined, () => {
        this.studio.select(workspace.GetChildren());
    })
    .separator()
    .submenu("Utilities")
    .action("Print selection", undefined, () => {
        print(this.studio.getSelection().size());
    })
    .root();

await menu.show();
```

Action callbacks are registered when you build the menu. `show()` does not return the selected action.