import { useMemo } from 'react';
import motionValue from '../motion-value';
import { poseToArray } from '../utils/pose-resolvers';

const usePose = (initPose = 'default') => {
  return useMemo(() => {
    const pose = motionValue(initPose, {
      transformer: (v: string | string[]) => poseToArray(v)
    });

    const setPose = (newPose: string | string[]) => pose.set(newPose);

    return [pose, setPose];
  }, []);
};

export default usePose;
