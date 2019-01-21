import { Poses } from "../../types"
import { PoseKeys } from "../types"
import { AnimationControls } from "./use-animation-controls"
import { resolvePoses, asDependencyList } from "./pose-resolvers"
import { useMemo, useEffect, useRef, useContext } from "react"
import { MotionContext } from "./MotionContext"

export const usePoses = (
    targetVariant: PoseKeys,
    variants: Poses,
    inherit: boolean,
    controls: AnimationControls,
    initialVariant: PoseKeys,
    onAnimationComplete?: () => void
) => {
    const parentVariant = useContext(MotionContext).variant
    const variantToResolve = inherit ? parentVariant : targetVariant
    const variantList = resolvePoses(variantToResolve)
    const hasMounted = useRef(false)

    controls.setPoses(variants)

    // Set initial value according to Pose
    useMemo(() => {
        const initial = initialVariant ? resolvePoses(initialVariant) : variantList
        controls.set(initial)
    }, [])

    // Fire animations when poses change
    useEffect(() => {
        if (inherit) return

        if (hasMounted.current || initialVariant) {
            controls.start(variantList).then(() => {
                onAnimationComplete && onAnimationComplete()
            })
        }

        hasMounted.current = true
    }, asDependencyList(variantList))
}
