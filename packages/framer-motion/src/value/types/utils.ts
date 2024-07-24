/**
 * TODO: When we move from string as a source of truth to data models
 * everything in this folder should probably be referred to as models vs types
 */

// If this number is a decimal, make it just five decimal places
// to avoid exponents
export const sanitize = (v: number) => Math.round(v * 100000) / 100000

export const floatRegex = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu
export const colorRegex =
    /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu
export const singleColorRegex =
    /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu

export function isString(v: any): v is string {
    return typeof v === "string"
}

export function isNullish(v: any): v is null | undefined {
    return v == null
}