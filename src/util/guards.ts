/**
 * Determines if a class does implement a method.
 * @param object
 * @param member
 */
export function doesImplement<T extends object>(object: object, member: keyof T): object is T {
	return member in object;
}
