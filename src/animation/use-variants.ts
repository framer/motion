import { VariantLabels } from "../motion/types"
import { ValueAnimationControls } from "./ValueAnimationControls"
import {
    resolveVariantLabels,
    asDependencyList,
} from "./utils/variant-resolvers"
import { useEffect, useRef } from "react"

const hasVariantChanged = (oldVariant: string[], newVariant: string[]) => {
    return oldVariant.join(",") !== newVariant.join(",")
}

/**
 * Handle variants and the `animate` prop when its set as variant labels.
 *
 * @param targetVariant
 * @param inherit
 * @param controls
 * @param initialVariant
 *
 * @internal
 */
export function useVariants(
    targetVariant: VariantLabels,
    inherit: boolean,
    controls: ValueAnimationControls,
    initialVariant: VariantLabels
) {
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
            controls.start(variantList)
        }

        hasMounted.current = true
    }, asDependencyList(variantList))
}
