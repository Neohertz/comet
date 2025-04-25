# System
Registers the decorated class as a system within comet.

## Type
```ts
type SystemConfig = {
	// Denotes that this system should only be initialized once
	// it's used as a dependency to another system.
	lazy?: boolean
}

System(config: SystemConfig = {})
```

## Usage

```ts
@System()
class MySystem implements OnInit {
	public onInit() {
		print("Hello, world!")
	}
}
```