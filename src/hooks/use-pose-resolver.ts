import { useRef, useEffect } from 'react';
import { invariant } from 'hey-listen';
import { tween, spring, keyframes, decay, physics } from 'popmotion';
import { poseToArray } from '../utils/pose-resolvers';
import { MotionValue } from '../motion-value';
import {
  MotionConfig,
  MotionProps,
  PoseResolver,
  Pose,
  Transition,
  TransitionMap
} from '../motion/types';

const transitions = { tween, spring, keyframes, decay, physics };

const defaultTransition = {
  type: 'spring',
  stiffness: 800,
  damping: 15
};

const getTransition = (
  valueKey: string,
  transition: Transition,
  to: string | number
) => {
  const transitionDefinition = transition
    ? transition[valueKey] ||
      (transition as TransitionMap).default ||
      transition
    : defaultTransition;

  const action = transitions[transitionDefinition.type || 'tween'];
  const opts = { ...transitionDefinition, to };

  return [action, opts];
};

const createPoseResolver = (
  values: Map<string, MotionValue>,
  config: MotionConfig,
  props: MotionProps
) => (poseList: string[]) => {
  poseList.forEach(poseKey => {
    invariant(
      config[poseKey] !== undefined,
      `Pose with name ${poseKey} not found.`
    );

    const pose: Pose =
      typeof config[poseKey] === 'function'
        ? (config[poseKey] as PoseResolver)(props)
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

      const [action, opts] = getTransition(valueKey, transition, target);

      value.control(action, opts);
    });
  });
};

const usePoseResolver = (
  values: Map<string, MotionValue>,
  config: MotionConfig,
  props: MotionProps
) => {
  const poseSubscriber = useRef(null);
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
      (pose as MotionValue).removeSubscriber(poseSubscriber.current);
    };
  });
};

export default usePoseResolver;
