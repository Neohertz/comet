# View
> Related: [GUI System](/api/modules/gui)

A view is a container for UI within comet.



## `mount()`
Mount a ui element or component tree to the viewport. 

### Type
```ts 
mount(method: ((root: Instance) => (() => void)) | Instance): void;
```

### Usage
You can mount any ui framwork you'd like with a story-like api.
```ts
this.view.mount((root) => {
	const unmount = createReactTree(root);
	return () => unmount()
}))
```

Alternatively, you can also directly mount an instance.

```ts 
this.view.mount(new Instance("Frame"))
```




## `onClose()` &  `onOpen()`
Bind a callback to be invoked when the view is opened or closed.
### Usage
```ts 
this.onClose(cb: () => void): void
this.onOpen(cb: () => void): void
```

## `setVisible()` 
Set the visibility of the window.
### Usage
```ts 
this.setVisible(state: boolean): void
```

## `linkButton()` 
Link a toolbar button to the visibility of the view.

### Usage
```ts 
this.linkButton(button: Button): void
```

## `getViewportSize()` 
Returns the viewport size, but only will only function as expected in viewport mode.
### Usage

```ts 
this.getViewportSize(): Vector2
```

