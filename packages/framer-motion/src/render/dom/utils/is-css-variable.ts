export type CSSVariableName = `--${string}`

export type CSSVariableToken = `var(${CSSVariableName})`

const checkStringStartsWith =
    <T extends string>(token: string) =>
    (key?: string): key is T =>
        typeof key === "string" && key.startsWith(token)

export const isCSSVariableName = checkStringStartsWith<CSSVariableName>("--")
export const isCSSVariableToken =
    checkStringStartsWith<CSSVariableToken>("var(--")

export const cssVariableRegex =
    /var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\)/g
