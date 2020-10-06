import { useEffect, useRef } from "react"
import { VariantLabels } from "../motion/types"
import {
    resolveVariantLabels,
    asDependencyList,
} from "./utils/variant-resolvers"
import { VisualElement } from "../render/VisualElement"
import { startVisualElementAnimation } from "../render/VisualElement/utils/animation"
import { useVariantContext } from "../motion/context/MotionContext"

const hasVariantChanged = (oldVariant: string[], newVariant: string[]) => {
    return oldVariant.join(",") !== newVariant.join(",")
}

/**
 * Handle variants and the `animate` prop when its set as variant labels.
 *
 * @param initial - Initial variant(s)
 * @param animate - Variant(s) to animate to
 * @param inherit - `true` is inheriting animations from parent
 * @param controls - Animation controls
 *
 * @internal
 */
export function useVariantAnimations(
    visualElement: VisualElement,
    initial: VariantLabels,
    animate: VariantLabels,
    inherit: boolean
) {
    let targetVariants = resolveVariantLabels(animate)
    const context = useVariantContext()

    const parentAlreadyMounted = context.parent?.isMounted
    const hasMounted = useRef(false)

    useEffect(() => {
        let shouldAnimate = false

        if (inherit) {
            // If we're inheriting variant changes and the parent has already
            // mounted when this component loads, we need to manually trigger
            // this animation.
            shouldAnimate = !!parentAlreadyMounted
            targetVariants = resolveVariantLabels(context.animate)
        } else {
            shouldAnimate =
                hasMounted.current ||
                hasVariantChanged(resolveVariantLabels(initial), targetVariants)
        }

        shouldAnimate &&
            startVisualElementAnimation(visualElement, targetVariants)

        hasMounted.current = true
    }, asDependencyList(targetVariants))
}
