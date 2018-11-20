import { useMemo } from 'react';
import motionValue, { MotionValue } from '../motion-value';

type PoseSetter = (pose: string | string[]) => void;

const usePose = (initPose = 'default') => {
  return useMemo((): [MotionValue, PoseSetter] => {
    const pose = motionValue(initPose);

    const setPose: PoseSetter = newPose => pose.set(newPose);

    return [pose, setPose];
  }, []);
};

export default usePose;
