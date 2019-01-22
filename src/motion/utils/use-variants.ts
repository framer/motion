import { VariantLabels } from "../types"
import { AnimationControls } from "./use-animation-controls"
import { resolvePoses, asDependencyList } from "./pose-resolvers"
import { useEffect, useRef } from "react"

const hasVariantChanged = (oldVariant: string[], newVariant: string[]) => {
    return oldVariant.join(",") !== newVariant.join(",")
}

export const useVariants = (
    targetVariant: VariantLabels,
    inherit: boolean,
    controls: AnimationControls,
    initialVariant: VariantLabels,
    onAnimationComplete?: () => void
) => {
    const variantList = resolvePoses(targetVariant)
    const hasMounted = useRef(false)

    // Fire animations when poses change
    useEffect(() => {
        // TODO: This logic might mean we don't need to load this hook at all
        if (inherit) return

        if (hasMounted.current || hasVariantChanged(resolvePoses(initialVariant), variantList)) {
            controls.start(variantList).then(() => {
                onAnimationComplete && onAnimationComplete()
            })
        }

        hasMounted.current = true
    }, asDependencyList(variantList))
}
