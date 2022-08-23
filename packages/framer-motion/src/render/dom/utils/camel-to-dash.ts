/**
 * Convert camelCase to dash-case properties.
 */
export const camelToDash = (str: string) =>
    str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
