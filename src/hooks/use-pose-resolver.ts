import { useRef, useEffect } from 'react';
import { invariant } from 'hey-listen';
import { tween, spring, keyframes, decay, physics } from 'popmotion';
import { poseToArray } from '../utils/pose-resolvers';
import motionValue, { MotionValue } from '../motion-value';
import { MotionConfig, MotionProps } from 'motion/types';

const transitions = { tween, spring, keyframes, decay, physics };

const defaultTransition = {
  type: 'spring',
  stiffness: 800,
  damping: 15
};

const getTransition = (key, transition, to) => {
  const transitionDefinition = transition
    ? transition[key] || transition.default || transition
    : defaultTransition;

  const action = transitions[transitionDefinition.type || 'tween'];
  const opts = { ...transitionDefinition, to };

  return [action, opts];
};

const createPoseResolver = (config, values, props) => pose => {
  console.log(pose);
};

const usePoseResolver = (
  values: Map<string, MotionValue>,
  config: MotionConfig,
  props: MotionProps
) => {
  const poseResolver = useRef(null);
  const { pose } = props;
  const prevPoseResolver = poseResolver.current;
  poseResolver.current = createPoseResolver(config, values, props);

  useEffect(() => {
    if (pose instanceof MotionValue) {
      pose.removeSubscriber(prevPoseResolver);
      pose.addSubscriber(poseResolver.current);
    } else if (prevPoseResolver) {
      poseResolver.current(pose);
    }
  });

  // const poseObservable =
  //   props.pose instanceof MotionValue
  //     ? props.pose.addOnUpdate()
  //     : motionValue(props.pose);

  // const poseProp = poseToArray(props.pose);

  // useEffect(() => poseObservable.set(poseProp), poseProp);

  // useEffect(() => {
  //   const hadPose = pose.current !== null;
  //   pose.current = poseToArray(props.pose);

  //   if (!hadPose || !props.pose) return;

  //   pose.current.forEach(poseKey => {
  //     // Resolve Pose with props if function here

  //     invariant(
  //       config[poseKey] !== undefined,
  //       `Pose with name ${poseKey} not found.` // Show available poses?
  //     );

  //     const { transition, ...thisPose } = config[poseKey];

  //     // TODO: Check to see if `transition` exists and generate default
  //     // based on keys being animated if not

  //     // Filter pose options like stagger children here
  //     Object.keys(thisPose).forEach(valueKey => {
  //       const value = values.get(valueKey);
  //       const target = thisPose[valueKey];

  //       invariant(
  //         value !== undefined,
  //         "Value not found. Ensure all animated values are created on component mount." // Maybe create this value on the fly instead?
  //       );

  //       value.control(...getTransition(valueKey, transition, target));
  //     });
  //   });
  // }, pose.current);
};

export default usePoseResolver;
