import { VariantLabels } from "../motion/types"
import { ValueAnimationControls } from "./ValueAnimationControls"
import {
    resolveVariantLabels,
    asDependencyList,
} from "./utils/variant-resolvers"
import { useEffect, useRef, useContext } from "react"
import { MotionContext } from "../motion"

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
    controls: ValueAnimationControls
) {
    const targetVariants = resolveVariantLabels(animate)
    const context = useContext(MotionContext)
    // const parentAlreadyMounted =
    //     context.hasMounted && context.hasMounted.current
    const hasMounted = useRef(false)

    console.log(inherit, animate, context.hasMounted)
    useEffect(() => {
        let shouldAnimate = false

        if (inherit) {
        } else {
            shouldAnimate =
                hasMounted.current ||
                hasVariantChanged(resolveVariantLabels(initial), targetVariants)
        }

        shouldAnimate && controls.start(targetVariants)

        hasMounted.current = true
    }, asDependencyList(targetVariants))
}
