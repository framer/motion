import { createContext, useContext, useMemo } from "react"
import { AnimationControls } from "./use-animation-controls"
import { PoseKeys } from "motion/types"
import { asDependencyList, resolvePoses } from "./pose-resolvers"

type MotionContextProps = {
    controls?: AnimationControls
    variant?: PoseKeys
    dragging: boolean
}

export const MotionContext = createContext<MotionContextProps>({ dragging: false })

export const useMotionContext = (controls: AnimationControls, inherit: boolean, variant?: PoseKeys) => {
    const { variant: parentVariant, dragging } = useContext(MotionContext)
    const context: MotionContextProps = useMemo(() => ({ controls, dragging }), asDependencyList(resolvePoses(variant)))

    context.variant = inherit ? parentVariant : variant

    return context
}
