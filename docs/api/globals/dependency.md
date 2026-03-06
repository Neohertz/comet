# Dependency
`Dependency()` resolves another registered system and returns its singleton instance.

::: warning
Call `Dependency()` only during system construction: field initializers, constructor parameters, or constructor body code. Calling it later throws at runtime.
:::

## Type
```ts
Dependency<T>(dependency: ClassRef<T>): T
```

## Behavior

- Resolves the requested system from comet's registry.
- Constructs lazy systems the first time they are requested.
- Rejects self-dependencies.
- Records the dependency so it can be initialized before launch completes.

## Usage
```ts
import { Audio, Dependency, GUI, History, OnInit, Studio, System } from "@rbxts/comet";

@System()
export class MySystem implements OnInit {
	private gui = Dependency(GUI);

	constructor(
		private audio = Dependency(Audio),
	) {
		const studio = Dependency(Studio);
	}

	onInit() {
		// Invalid: this is no longer constructor-time code.
		const history = Dependency(History);
	}
}
```

If you need a system later, store the reference during construction and reuse it.