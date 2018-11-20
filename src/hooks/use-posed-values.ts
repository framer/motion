import motionValue, { MotionValue } from '../motion-value';
import { resolvePoses } from '../utils/pose-resolvers';
import { MotionConfig, MotionProps } from '../motion/types';
import { useRef, useEffect, RefObject } from 'react';
import styler from 'stylefire';

export default (
  config: MotionConfig,
  props: MotionProps,
  ref: RefObject<Element>
): [Map<string, MotionValue>, Partial<MotionProps>] => {
  const values = useRef(new Map()).current;
  const returnedProps = {};

  // In this function we want to find the right approach to ensure
  // we successfully remove MotionValues from the returned props
  // in a performant way over subsequent renders.

  // 1. Bind stylers to provided motion values via props
  Object.keys(props).forEach(key => {
    const prop = props[key];

    if (prop instanceof MotionValue) {
      values.set(key, prop);
    } else {
      returnedProps[key] = prop;
    }
  });

  // 2. Create values from poses
  const { pose = 'default' } = props;
  const initialPoses = resolvePoses(pose);

  initialPoses.forEach(poseKey => {
    const poseDef = config[poseKey];
    if (!poseDef) return;

    const initialPose =
      typeof poseDef === 'function' ? poseDef(props) : poseDef;

    // We'll need to filter out options like staggerChildren etc
    Object.keys(initialPose).forEach(valueKey => {
      if (!values.has(valueKey)) {
        values.set(valueKey, motionValue(initialPose[valueKey]));
      }
    });
  });

  // 3. Bind stylers when ref is ready
  useEffect(() => {
    if (!ref.current) return;

    const domStyler = styler(ref.current);

    values.forEach((value, key) => {
      value.setOnRender((v: any) => domStyler.set(key, v));
    });

    return () => values.forEach(value => value.destroy());
  }, []);

  return [values, returnedProps];
};
