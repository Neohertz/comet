# Comet
Comet's initialization methods.

## `createApp()`

Setup the comet app. The name will be used for the plugin ribbon.

### Type
```ts
createApp(name: string, enabledWhileRunning = false): void
```

### Usage
```ts
Comet.createApp("MyAwesomeApp")
```

## `addPaths()`

Used to find and register systems within a folder or instance.
### Type 
```ts
addPaths(path?: Instance, recursive = false): void
```

### Usage
```ts
// Recursively search through the "systems" folder.
Comet.addPaths(script.Parent:FindFirstChild("systems"), true)
```


## `configureLogger()`
Configure the internal logger. By default, the log level is set to `LogLevel.FATAL`.

### Type 
```ts
configureLogger(level: LogLevel, showLevel = true, showPluginName = false): void
```

### Usage
```ts
// Only allow errors with no fluff.
Comet.configureLogger(LogLevel.ERROR, false, false)) 
```

## `launch()`
Launch comet. Initialize all systems and dependencies, and launch any lifecycle methods.

::: warning
This should only be called after app creation and path registration.
:::

### Type 
```ts
launch(): void
```

### Usage
```ts
// Recursively search through the "systems" folder.
Comet.launch()
```
