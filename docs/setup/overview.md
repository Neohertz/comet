# Welcome to Comet
Comet is a TypeScript framework for Roblox Studio plugins. It gives you a system-based structure, predictable dependency resolution, lifecycle hooks, and a small set of utility systems for common plugin APIs.

## Why choose Comet?

### Maintainability
Plugin code tends to become a messy web of setup, cleanup, and Studio-specific boilerplate. Comet cuts down on that so you can spend more time building plugin behavior, and less time battling the plugin API.

### Singleton Architecture
Comet is built around singleton systems. Each system is registered once, constructed once, and can depend on other systems through `Dependency()` for predictable dependency management.

### Utility Systems
It also ships with internal utility systems for common plugin tasks like UI creation, Studio selection helpers, undo recording, and audio playback. Those wrappers plug into Comet's tracking and unload behavior, so framework-managed resources get cleaned up for you.

## Install

Install Comet with whatever package manager you prefer.

```bash
# NPM
npm i @rbxts/comet

# Bun
bun add @rbxts/comet

# Yarn 
yarn add @rbxts/comet

# PNPM
pnpm add @rbxts/comet
```

## Example projects

These open-source projects use Comet `v2.0`.

- `neohertz/luau-type-gen` ([link](https://github.com/Neohertz/luau-type-gen))

## Credits

> The project currently uses a placeholder icon from [flaticon](https://www.flaticon.com/free-icons/comet).