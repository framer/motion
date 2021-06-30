import { useEffect, useRef } from "react"
import { getValueTransition } from "../../../animation/utils/transitions"
import { animateDelta } from "../../../projection"
import { createBox } from "../../../projection/geometry/models"
import { boxEquals } from "../../../projection/geometry/utils"
import { FeatureProps } from "../types"

export function AnimateLayout({
    visualElement,
    layout,
    layoutId,
}: FeatureProps) {
    const { projection } = visualElement
    const layoutTarget = useRef(createBox())

    useEffect(() => {
        if (!(layout || layoutId) || !projection) return

        return projection.onLayoutDidUpdate(
            ({ layout: newLayout, delta, hasLayoutChanged }) => {
                // TODO: Check here if an animation exists
                const layoutTransition =
                    visualElement.getDefaultTransition() ||
                    defaultLayoutTransition

                const { onLayoutAnimationComplete } = visualElement.getProps()

                if (
                    hasLayoutChanged &&
                    /**
                     * Don't create a new animation if the target box
                     * hasn't changed TODO: And we're already animating
                     */
                    !boxEquals(layoutTarget.current, newLayout)
                ) {
                    // TODO: On final frame, delete delta
                    animateDelta(projection, delta, {
                        ...getValueTransition(layoutTransition, "layout"),
                        onComplete: onLayoutAnimationComplete,
                    })
                }

                layoutTarget.current = newLayout
            }
        )
    }, [layout, layoutId])

    return null
}

const defaultLayoutTransition = {
    duration: 0.45,
    ease: [0.4, 0, 0.1, 1],
}
