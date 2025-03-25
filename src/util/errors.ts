export enum Errors {
	SYSTEM_NOT_FOUND = "System '%s' was not found.",
	SELF_DEPENDENCY = "System '%s' attempted to depend on itself.",
	INVALID_SYSTEM = "Attempted to add '%s' as a dependency, but it isn't a valid system. Did you forget to use the @System decorator?",
	DEPENDENCY_OUTSIDE_CONSTRUCTOR = "Attempted use of Dependency() function outside of a system's constructor.",
}
