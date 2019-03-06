export type WithCustom = {
    [key: string]: any
    size?: string | number
    image?: string
}

export const transformCustomValues = <T extends WithCustom>(values: T) => {
    // Return early if we're not changing any values
    if (values.size === undefined && values.image === undefined) {
        return values
    }

    const { size, image, ...remainingValues } = values

    if (size !== undefined) {
        remainingValues.height = remainingValues.width = size
    }

    if (image !== undefined) {
        remainingValues.backgroundImage = image
    }

    return remainingValues
}
