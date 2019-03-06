export type WithCustom = {
    [key: string]: any
    size?: string | number
    image?: string
}

// If this function grows with new properties it'll probably benefit from a map approach
export const transformCustomValues = <T extends WithCustom>(values: T) => {
    // Return early if we're not changing any values
    if (values.size === undefined && values.image === undefined) {
        return values
    }

    const { size, image, ...remainingValues } = values as any // Spread generics bug

    if (size !== undefined) {
        remainingValues.height = remainingValues.width = size
    }

    if (image !== undefined) {
        remainingValues.backgroundImage =
            image.substring(0, 4) === "url(" ? image : `url(${image})`
    }

    return remainingValues
}
