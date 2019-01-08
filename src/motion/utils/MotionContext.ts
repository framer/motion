import { createContext, useContext, useMemo } from "react"
import { AnimationControls } from "./use-animation-controls"
import { PoseKeys } from "motion/types"
import { asDependencyList, resolvePoses } from "./pose-resolvers"

type MotionContextProps = {
    controls?: AnimationControls
    pose?: PoseKeys
}

export const MotionContext = createContext<MotionContextProps>({})

export const useMotionContext = (controls: AnimationControls, inherit: boolean, pose?: PoseKeys) => {
    const parentPose = useContext(MotionContext).pose
    const context: MotionContextProps = useMemo(() => ({ controls }), asDependencyList(resolvePoses(pose)))

    context.pose = inherit ? parentPose : pose

    return context
}
