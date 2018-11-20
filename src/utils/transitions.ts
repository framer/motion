import { tween, spring, keyframes, decay, physics, easing } from 'popmotion';
import { Transition, TransitionMap, Tween, Keyframes } from '../motion/types';
import { invariant } from 'hey-listen';

const transitions = { tween, spring, keyframes, decay, physics };

const defaultTransition = {
  type: 'spring',
  stiffness: 800,
  damping: 15
};

const {
  linear,
  easeIn,
  easeOut,
  easeInOut,
  circIn,
  circOut,
  circInOut,
  backIn,
  backOut,
  backInOut,
  anticipate
} = easing;

const easingLookup: { [key: string]: (num: number) => number } = {
  linear,
  easeIn,
  easeOut,
  easeInOut,
  circIn,
  circOut,
  circInOut,
  backIn,
  backOut,
  backInOut,
  anticipate
};

const transitionOptionParser = {
  tween: (opts: Tween): Tween => {
    const { ease } = opts;

    if (Array.isArray(ease)) {
      // If cubic bezier definition, create bezier curve
      invariant(
        ease.length === 4,
        `Cubic bezier arrays must contain four numerical values.`
      );

      const [x1, y1, x2, y2] = ease;
      opts.ease = easing.cubicBezier(x1, y1, x2, y2);
    } else if (typeof ease === 'string') {
      // Else lookup from table
      invariant(
        easingLookup[ease] !== undefined,
        `Invalid easing type '${ease}'`
      );
      opts.ease = easingLookup[ease];
    }

    return opts;
  },
  keyframes: ({ from, to, ...opts }: Keyframes) => opts
};

const preprocessOptions = (
  type: string,
  opts: Partial<Transition>
): Partial<Transition> =>
  transitionOptionParser[type] ? transitionOptionParser[type](opts) : opts;

export default (
  valueKey: string,
  to: string | number,
  transition?: Transition
) => {
  const transitionDefinition = transition
    ? transition[valueKey] ||
      (transition as TransitionMap).default ||
      transition
    : defaultTransition;

  const type = transitionDefinition.type || 'tween';
  const action = transitions[type];
  const opts = preprocessOptions(type, { ...transitionDefinition, to });

  return [action, opts];
};
