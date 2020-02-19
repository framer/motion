/**
 * Check if value is a numerical string, ie "100" or "100px"
 */
export const isNumericalString = (v: string) => /^\d*\.?\d+$/.test(v)
