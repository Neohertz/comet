
# Menu
> Related: [GUI System](/api/modules/gui)

The menu is a builder that allows you to construct context menus.

## Usage
```ts 
const contextMenu = GUI.buildMenu()
    .action(
        "Select all items in Workspace", 
        "icon_asset_id", 
        () => {
		    this.select(game.Workspace.GetChildren());
	    }
    ) // Example of a functional button
    .seperator()
	.submenu("Misc Methods")
        .action("Do something")
        .action("Do something else");
		.root() // Return back to the root
	.subMenu("More Methods")
		.action("Do yet another thing.");

contextMenu.show()
```