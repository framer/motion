import { Poses } from "../../types"
import { PoseKeys } from "../types"
import { AnimationControls } from "./use-animation-controls"
import { resolvePoses, asDependencyList } from "./pose-resolvers"
import { useMemo, useEffect, useRef, useContext } from "react"
import { MotionContext } from "./MotionContext"

export const usePoses = (
    poses: Poses,
    inherit: boolean,
    controls: AnimationControls,
    onPoseComplete?: () => void,
    pose?: PoseKeys,
    initialPose?: PoseKeys
) => {
    const parentPose = useContext(MotionContext).pose
    const poseToResolve = inherit ? parentPose : pose
    const poseList = resolvePoses(poseToResolve)
    const hasMounted = useRef(false)

    controls.setPoses(poses)

    // Set initial value according to Pose
    useMemo(() => {
        const initial = initialPose ? resolvePoses(initialPose) : poseList
        controls.set(initial)
    }, [])

    // Fire animations when poses change
    useEffect(() => {
        if (inherit) return

        if (hasMounted.current || initialPose) {
            controls.start(poseList).then(() => {
                onPoseComplete && onPoseComplete()
            })
        }

        hasMounted.current = true
    }, asDependencyList(poseList))
}
