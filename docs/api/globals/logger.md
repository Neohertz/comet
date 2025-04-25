# Logger
Comet routes its internal debug messages through a logger that you can use. 

It's emit can be configured via `Comet.configureLogger()`.

## Log Levels
1. SYSTEM - Includes comet debug messages.
2. VERBOSE
3. WARNING
4. ERROR
5. FATAL
6. SILENT - No logging.


## Usage

```ts
@System()
class MySystem implements OnInit {
	public onInit() {
		Logger.warn("This is a warning!") // [MyApp] [Location] [WRN] This is a warning!
	}
}
```