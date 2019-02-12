import { VariantLabels } from "../motion/types"
import { AnimationControls } from "./AnimationControls"
import {
    resolveVariantLabels,
    asDependencyList,
} from "./utils/variant-resolvers"
import { useEffect, useRef } from "react"

const hasVariantChanged = (oldVariant: string[], newVariant: string[]) => {
    return oldVariant.join(",") !== newVariant.join(",")
}

/**
 *
 * @param targetVariant
 * @param inherit
 * @param controls
 * @param initialVariant
 * @param onAnimationComplete
 * @internal
 */
export const useVariants = (
    targetVariant: VariantLabels,
    inherit: boolean,
    controls: AnimationControls,
    initialVariant: VariantLabels,
    onAnimationComplete?: () => void
) => {
    const variantList = resolveVariantLabels(targetVariant)
    const hasMounted = useRef(false)

    // Fire animations when poses change
    useEffect(() => {
        // TODO: This logic might mean we don't need to load this hook at all
        if (inherit) return

        if (
            hasMounted.current ||
            hasVariantChanged(resolveVariantLabels(initialVariant), variantList)
        ) {
            controls.start(variantList).then(() => {
                onAnimationComplete && onAnimationComplete()
            })
        }

        hasMounted.current = true
    }, asDependencyList(variantList))
}
