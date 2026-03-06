# System
`@System()` registers a class as a comet-managed singleton.

## Type
```ts
type SystemConfig = {
	lazy?: boolean;
};

System(config: SystemConfig = {})
```

## Notes

- Systems are constructed once and reused.
- A lazy system is not constructed during registration. It is constructed the first time another system requests it with `Dependency()`.
- Lifecycle hooks such as `onInit()` and `onStart()` are optional.

## Usage
```ts
import { OnInit, System } from "@rbxts/comet";

@System()
export class MySystem implements OnInit {
	public onInit() {
		print("Hello, world!");
	}
}
```