import { useMemo, useContext } from "react"
import { resolvePoses } from "./pose-resolvers"
import { MotionContext } from "./MotionContext"
import { useSubsequentRenderEffect } from "../../../_src/hooks/use-subsequent-render-effect"

export const usePoses = (playbackControls, pose, inheritPose, onPoseComplete) => {
    const parentPose = useContext(MotionContext).pose
    const poseToResolve = inheritPose ? parentPose : pose
    const poseList = resolvePoses(poseToResolve)

    // Set initial value according to pose
    useMemo(() => {
        poseList.forEach(poseKey => playbackControls.set(poseKey))
    }, [])
    console.log(poseList)
    useSubsequentRenderEffect(
        () => {
            const animations = poseList.map(poseKey => playbackControls.start(poseKey))

            Promise.all(animations).then(() => {
                onPoseComplete && onPoseComplete()
            })
        },
        inheritPose ? [] : poseList // TODO make this all better
    )
}
