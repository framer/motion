// Call a handler once for each axis
export function eachAxis<T>(handler: (axis: "x" | "y") => T): T[] {
    return [handler("x"), handler("y")]
}
