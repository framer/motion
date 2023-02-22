export type CSSVariable = `--${string}`

/**
 * Returns true if the provided key is a CSS variable
 */
export function isCSSVariable(key?: string): key is CSSVariable {
    console.log(key)
    return typeof key === "string" && key.startsWith("--")
}
