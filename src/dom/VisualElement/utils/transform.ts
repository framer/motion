const transformKeys = new Set(["x", "y", "z"])

const axes = ["", "X", "Y", "Z"]
const types = ["translate", "scale", "rotate", "skew", "transformPerspective"]

types.forEach(type => axes.forEach(axis => transformKeys.add(type + axis)))

export const transformOrder = Array.from(transformKeys)

export function isTransformProp(key: string) {
    return transformKeys.has(key)
}

export function isTransformOriginProp(key: string) {
    return key === "originX" || key === "originY" || key === "originY"
}

export function sortTransformProps(a: string, b: string) {
    return transformOrder.indexOf(a) - transformOrder.indexOf(b)
}
