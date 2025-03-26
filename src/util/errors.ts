export enum ERROR {
	INVALID_PATH = "Instance provided to addPaths() is not an instance.",
	CREATED_APP_TWICE = "You've attempted to call createApp() more than once!",
	SYSTEM_NOT_FOUND = "System '%s' was not found.",
	SELF_DEPENDENCY = "System '%s' attempted to depend on itself.",
	INVALID_SYSTEM = "Attempted to add '%s' as a dependency, but it isn't a valid system. Did you forget to use the @System decorator?",
	DEPENDENCY_OUTSIDE_CONSTRUCTOR = "Attempted use of Dependency() function outside of a system's constructor.",
	APP_NOT_CREATED = "App has not been created. Did you forget to call createApp()?"
}
