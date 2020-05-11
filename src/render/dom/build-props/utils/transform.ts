const axes = ["", "X", "Y", "Z"]
const order = ["translate", "scale", "rotate", "skew", "transformPerspective"]

export const transformProps = ["x", "y", "z"]

order.forEach(operationKey => {
    axes.forEach(axesKey => {
        transformProps.push(operationKey + axesKey)
    })
})

const transformPropDictionary = {}
transformProps.forEach(key => (transformPropDictionary[key] = true))

export function isTransformProp(key: string) {
    return transformPropDictionary[key] === true
}

export function sortTransformProps(a: string, b: string) {
    return transformProps.indexOf(a) - transformProps.indexOf(b)
}

const transformOriginProps = new Set(["originX", "originY", "originZ"])

export function isTransformOriginProp(key: string) {
    return transformOriginProps.has(key)
}
