import { createContext, useContext, useMemo } from "react"
import { AnimationControls } from "./use-animation-controls"
import { PoseKeys } from "motion/types"
import { asDependencyList, resolvePoses } from "./pose-resolvers"

type MotionContextProps = {
    controls?: AnimationControls
    pose?: PoseKeys
    dragging: boolean
}

export const MotionContext = createContext<MotionContextProps>({ dragging: false })

export const useMotionContext = (controls: AnimationControls, inherit: boolean, pose?: PoseKeys) => {
    const { pose: parentPose, dragging } = useContext(MotionContext)
    const context: MotionContextProps = useMemo(() => ({ controls, dragging }), asDependencyList(resolvePoses(pose)))

    context.pose = inherit ? parentPose : pose

    return context
}
