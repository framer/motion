/**
 * Convert camelCase to dash-case properties.
 */
export const camelToDash = (str: string) =>
    str.replace(/([a-z])([A-Z])/gu, "$1-$2").toLowerCase()
