# comet.ts
A fast plugin framework inspired by Flamework.

## v1.1.0
- Added `record()` member that abstracts undo/redo.
- Added `createCopy` parameter to the `mount()` method overload that handles passing GuiBase objects.
- `createButton()` now has an optional parameter to allow it to be used outside of the viewport (in script view).
- Added `setEnabled()` to button class. 
- Added support for actions with `createAction()`.
- Added `onSelectionChanged()` callback. May move selection methods elsewhere.

[Docs](https://neohertz.dev/docs/comet/about)
