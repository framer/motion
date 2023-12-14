export type CSSVariableName = `--${string}`

export type CSSVariableToken = `var(${CSSVariableName})`

const checkStringStartsWith =
    <T extends string>(token: string) =>
    (key?: string | number | null): key is T =>
        typeof key === "string" && key.startsWith(token)

export const isCSSVariableName = checkStringStartsWith<CSSVariableName>("--")

const startsAsVariableToken = checkStringStartsWith<CSSVariableToken>("var(--")
export const isCSSVariableToken = (key?: string): key is CSSVariableToken =>
    startsAsVariableToken(key) && singleCssVariableRegex.test(key)

export const cssVariableRegex =
    /var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\)/g
const singleCssVariableRegex =
    /var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\)$/i
