const CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g
const REPLACE_TEMPLATE = "$1-$2"

/**
 * Convert camelCase to dash-case properties.
 */
export const camelToDash = (str: string) =>
    str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase()
