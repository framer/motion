import { Poses } from "../../types"
import { AnimationManager } from "../../animation"
import { PoseKeys } from "../types"
import { AnimationControls } from "./use-animation-controls"
import { resolvePoses } from "./pose-resolvers"
import { useMemo, useEffect, useRef } from "react"

const isPoses = (animation: any): animation is Poses => {
    return !(animation instanceof AnimationManager) && animation !== undefined
}

export const usePoses = (
    animation: AnimationManager | Poses | undefined,
    pose: PoseKeys,
    controls: AnimationControls,
    onPoseComplete: () => void
) => {
    const hasMounted = useRef(false)
    const isPoseControlled = isPoses(animation)
    const poseList = resolvePoses(pose)

    // Set initial value according to Pose
    useMemo(
        () => {
            if (!isPoseControlled) return
            poseList.forEach(poseKey => {
                const pose = (animation as Poses)[poseKey]
                pose && controls.set(pose)
            })
        },
        [isPoseControlled]
    )

    // Fire animations when poses change
    useEffect(() => {
        if (!isPoseControlled) return

        if (hasMounted.current) {
            const animations = poseList.map(poseKey => {
                const pose = (animation as Poses)[poseKey]
                pose && controls.start(pose)
            })

            Promise.all(animations).then(() => {
                onPoseComplete && onPoseComplete()
            })
        }

        hasMounted.current = true
    }, poseList)
}

// import { useMemo, useContext } from "react"
// import { resolvePoses } from "./pose-resolvers"
// import { MotionContext } from "./MotionContext"
// import { useSubsequentRenderEffect } from "../../../_src/hooks/use-subsequent-render-effect"

// export const usePoses = (playbackControls, pose, inheritPose, onPoseComplete) => {
//     const parentPose = useContext(MotionContext).pose
//     const poseToResolve = inheritPose ? parentPose : pose
//     const poseList = resolvePoses(poseToResolve)

//     // Set initial value according to pose
//     useMemo(() => {
//         poseList.forEach(poseKey => playbackControls.set(poseKey))
//     }, [])
//     console.log(poseList)
//     useSubsequentRenderEffect(
//         () => {
//             const animations = poseList.map(poseKey => playbackControls.start(poseKey))

//             Promise.all(animations).then(() => {
//                 onPoseComplete && onPoseComplete()
//             })
//         },
//         inheritPose ? [] : poseList // TODO make this all better
//     )
// }
