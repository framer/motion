import { MotionValue } from '../motion-value';

type PoseNameList = string[];
type PoseName = string | PoseNameList;
type UnresolvedPose = PoseName | MotionValue;

export const poseToArray = (pose: PoseName): PoseNameList =>
  Array.isArray(pose) ? [...pose].reverse() : [pose];

export const resolvePoses = (pose: UnresolvedPose): PoseNameList => {
  const unresolvedPose =
    pose instanceof MotionValue ? (pose.get() as string) : pose;

  return poseToArray(unresolvedPose);
};
