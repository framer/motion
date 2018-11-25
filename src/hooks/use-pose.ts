import { useMemo, ComponentType } from "react"
import { MotionValue, motionValue } from "../motion-value"
import { DefaultPose, ComponentPoseNames } from "motion/types"

type PoseSetter<Poses> = {
    (pose: Poses | Poses[]): void
    cycle: () => void
}

type PoseNames<T> = DefaultPose<T extends ComponentType ? ComponentPoseNames<T> : T>

export const usePose = <AllowedPoses extends ComponentType | string = string>(
    initPose: (PoseNames<AllowedPoses>) | PoseNames<AllowedPoses>[] = "default",
    posesOrComponent?: (PoseNames<AllowedPoses>)[]
) => {
    type Poses = PoseNames<AllowedPoses>
    type Setter = PoseSetter<Poses>
    const poses = posesOrComponent ? (Array.isArray(posesOrComponent) ? posesOrComponent : []) : undefined
    return useMemo((): [MotionValue, Setter] => {
        let i = typeof initPose === "string" && poses ? poses.indexOf(initPose) : 0

        const pose = motionValue(initPose)

        const setPose: Setter = newPose => {
            if (poses && typeof newPose === "string") {
                const poseIndex = poses.indexOf(newPose)
                i = poseIndex > -1 ? poseIndex : i
            }
            pose.set(newPose)
        }

        // Add cycle functionality
        setPose.cycle = () => {
            if (!poses) return

            const numPoses = poses.length
            i++
            if (i >= numPoses) i = 0
            setPose(poses[i])
        }

        return [pose, setPose]
    }, poses || [])
}
