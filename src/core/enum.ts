/**
 * Deturmine the depth of logging.
 */
export enum LogLevel {
	/**
	 * At this level, **all** logs will be printed to the console. *This including comet's internal debug messages.*
	 */
	SYSTEM = 0,
	VERBOSE = 1,
	WARNING = 2,
	ERROR = 3,
	FATAL = 4,
	/**
	 * At this level, the logger will do nothing.
	 */
	SILENT = 5
}

/**
 * Internal errors for comet.
 *
 * **Used internally**
 */
export enum CometError {
	INVALID_PATH = "Instance provided to addPaths() is not an instance.",
	CREATED_APP_TWICE = "You've attempted to call createApp() more than once!",
	SYSTEM_NOT_FOUND = "System '%s' was not found.",
	SELF_DEPENDENCY = "System '%s' attempted to depend on itself.",
	INVALID_SYSTEM = "Attempted to add '%s' as a dependency, but it isn't a valid system. Did you forget the decorator?",
	DEPENDENCY_OUTSIDE_CONSTRUCTOR = "Attempted use of Dependency() function outside of a system's constructor.",
	APP_NOT_CREATED = "App has not been created. Did you forget to call createApp()?"
}
