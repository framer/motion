import { useRef, useEffect, MutableRefObject } from 'react';
import { invariant } from 'hey-listen';
import getTransition from '../utils/transitions';
import { poseToArray } from '../utils/pose-resolvers';
import { resolveCurrent, resolveVelocity } from '../utils/resolve-values';
import { MotionValue } from '../motion-value';
import { PoseConfig, MotionProps, PoseResolver, Pose } from '../motion/types';

type PoseSubscriber = (v: string | string[]) => void;

const createPoseResolver = (
  values: Map<string, MotionValue>,
  config: PoseConfig,
  props: MotionProps
) => (poseList: string[]) => {
  poseList.forEach(poseKey => {
    invariant(
      config[poseKey] !== undefined,
      `Pose with name ${poseKey} not found.`
    );

    const pose: Pose =
      typeof config[poseKey] === 'function'
        ? (config[poseKey] as PoseResolver)(
            props,
            resolveCurrent(values),
            resolveVelocity(values)
          )
        : (config[poseKey] as Pose);

    const { transition, ...thisPose } = pose;

    // TODO: Check to see if `transition` exists and generate default
    // based on keys being animated if not

    // Filter pose options like stagger children here
    Object.keys(thisPose).forEach(valueKey => {
      const value = values.get(valueKey);
      const target = thisPose[valueKey];

      invariant(
        value !== undefined,
        'Value not found. Ensure all animated values are created on component mount.' // Maybe create this value on the fly instead?
      );

      const [action, opts] = getTransition(valueKey, target, transition);

      value && value.control(action, opts);
    });
  });
};

const usePoseResolver = (
  values: Map<string, MotionValue>,
  config: PoseConfig,
  props: MotionProps
) => {
  const poseSubscriber: MutableRefObject<null | PoseSubscriber> = useRef(null);
  const { pose } = props;
  const poseIsSubscription = pose instanceof MotionValue;
  const poseResolver = createPoseResolver(values, config, props);

  // If we're controlled by props, fire resolver with latest pose
  const poseList = !poseIsSubscription
    ? poseToArray(pose as string | string[])
    : [];
  useEffect(() => {
    if (!poseIsSubscription) poseResolver(poseList);
  }, poseList);

  // Or if we're using a pose subscription, manage subscriptions
  useEffect(() => {
    if (!poseIsSubscription) return;

    poseSubscriber.current = (v: string | string[]) =>
      poseResolver(poseToArray(v));
    (pose as MotionValue).addSubscriber(poseSubscriber.current);

    return () => {
      if (poseSubscriber.current) {
        (pose as MotionValue).removeSubscriber(poseSubscriber.current);
      }
    };
  });
};

export default usePoseResolver;
