import { useEffect } from "react"
import { animateDelta } from "../../../projection"
import { FeatureProps } from "../types"

export function AnimateLayout({
    visualElement,
    layout,
    layoutId,
}: FeatureProps) {
    const { projection } = visualElement

    useEffect(() => {
        if (!(layout || layoutId) || !projection) return

        return projection.onLayoutDidUpdate(({ delta, hasLayoutChanged }) => {
            // TODO: Check here if an animation exists
            // TODO: Get transition from visualElement.getProps()
            if (hasLayoutChanged) {
                animateDelta(projection, delta, { duration: 2 })
            }
        })
    }, [layout, layoutId])

    return null
}
