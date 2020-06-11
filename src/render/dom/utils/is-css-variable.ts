/**
 * Returns true if the provided key is a CSS variable
 */
export function isCSSVariable(key: string) {
    return key.startsWith("--")
}
