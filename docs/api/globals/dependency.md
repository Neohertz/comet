# Dependency
Register a dependency within a system.

::: warning
This should only be called within the constructor. Failure to do so will result in errors.

See the `Usage` field for valid examples.
:::


## Type
```ts
Dependency<T>(dependency: ClassRef<T>): T
```

## Usage
```ts
@System()
class MySystem implements OnInit {
	// ✅ Valid - Complies within constructor.
	private gui = Dependency(GUI)

	constructor(
		// ✅ Valid
		private audio = Dependency(Audio)
	) {
		// ✅ Valid
		const studio = Dependency(Studio)
	}

	onInit() {
		// ❌ Invalid! Cannot use Dependency() outside of constructor.
		const history = Dependency(History)
	}
}
```


## 