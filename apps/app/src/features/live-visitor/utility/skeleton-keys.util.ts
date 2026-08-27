/**
 * Stable keys for fixed-length loading placeholders.
 *
 * Placeholder rows never reorder, but using the array index as the React
 * key trips `noArrayIndexKey`; mapping over real string keys keeps the
 * intent obvious and the linter satisfied.
 */
export function skeletonKeys(count: number, prefix: string): string[] {
	return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}
