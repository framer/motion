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

    return Array.from(new Set(poseToArray(unresolvedPose)))
}

/**
 * Hooks in React sometimes accept a dependency array as their final argument. (ie useEffect/useMemo)
 * When values in this array change, React re-runs the dependency. However if the array
 * contains a variable number of items, React throws an error.
 */
export const asDependencyList = (list: PoseNameList): string[] => [list.join(",")]
