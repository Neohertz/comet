/**
 * Allows passing a class itself instead of an instnace.
 */
export interface ClassRef<T> {
	new (): T;
}
