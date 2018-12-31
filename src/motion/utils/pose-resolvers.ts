import { MotionValue } from "../../value"

type PoseNameList = string[]
type PoseName = string | PoseNameList
type UnresolvedPose = PoseName | MotionValue

const poseToArray = (pose?: PoseName): PoseNameList => {
    if (!pose) {
        return []
    }
    if (Array.isArray(pose)) {
        return pose
    }
    return [pose]
}

export const resolvePoses = (pose?: UnresolvedPose): PoseNameList => {
    const unresolvedPose = pose instanceof MotionValue ? (pose.get() as string) : pose

    return ["default", ...poseToArray(unresolvedPose)]
}
