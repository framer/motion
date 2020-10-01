import { useEffect, useRef, useContext } from "react"
import { VariantLabels } from "../motion/types"
import { VisualElementAnimationControls } from "./VisualElementAnimationControls"
import {
    resolveVariantLabels,
    asDependencyList,
} from "./utils/variant-resolvers"
import { MotionContext } from "../motion/context/VisualElementContext"

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
export function useVariants(
    initial: VariantLabels,
    animate: VariantLabels,
    inherit: boolean,
    controls: VisualElementAnimationControls
) {
    let targetVariants = resolveVariantLabels(animate)
    const context = useContext(MotionContext)

    // TODO Replace with visualElement hasMounted check
    const parentAlreadyMounted =
        context.hasMounted && context.hasMounted.current
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

        shouldAnimate && controls.start(targetVariants)

        hasMounted.current = true
    }, asDependencyList(targetVariants))
}
