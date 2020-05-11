export type ResolvedValues = { [key: string]: string | number }

export type Dimensions = {
    x: number
    y: number
    width: number
    height: number
}

export interface SVGAttributes {
    [key: string]: any
    style: {
        transform?: string
        transformOrigin?: string
    }
}
