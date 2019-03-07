// If this function grows with new properties it'll probably benefit from a map approach
export const transformCustomValues = <T extends any>(values: T): T => {
    // Return early if we're not changing any values
    if (values.size === undefined && values.image === undefined) {
        return values
    }

    const { size, image, ...remainingValues } = values as any // Spread generics bug

    if (size !== undefined) {
        remainingValues.height = remainingValues.width = size
    }

    if (image !== undefined) {
        let backgroundImage = image
        if (!image.startsWith("url(")) {
            backgroundImage = `url(${image})`
        }
        remainingValues.backgroundImage = backgroundImage
        if (remainingValues.backgroundSize === undefined) {
            remainingValues.backgroundSize = "cover"
        }
    }

    return remainingValues
}
