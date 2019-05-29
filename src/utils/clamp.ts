/**
 * Clamp a number within a range.
 *
 * @param min - The minimum `value`.
 * @param max - The maximum `value`.
 * @param value - The value to clamp within the given range.
 * @returns The value as clamped within `min` and `max`.
 *
 * @public
 */
export function clamp(min: number, max: number, v: number) {
    return Math.min(max, Math.max(min, v))
}
