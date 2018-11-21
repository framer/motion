import {
  action,
  tween,
  spring,
  keyframes,
  decay,
  physics,
  easing,
  Action
} from 'popmotion';
import {
  Transition,
  TransitionProp,
  Tween,
  Keyframes,
  EasingFunction,
  TransitionMap
} from '../motion/types';
import getDefaultTransition from './default-transitions';
import { invariant } from 'hey-listen';
import { ActionFactory } from '../motion-value';

type JustProps = { to: string | number };
const just: ActionFactory = ({ to }: JustProps): Action =>
  action(({ update, complete }) => {
    update(to);
    complete();
  });

const transitions = { tween, spring, keyframes, decay, physics, just };

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

const easingLookup: { [key: string]: EasingFunction } = {
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

const getTransition = (
  valueKey: string,
  to: string | number,
  transitionProp?: TransitionProp
): Transition => {
  if (transitionProp !== undefined) {
    let transition: Transition = {};

    if (transitionProp === false || transitionProp[valueKey] === false) {
      transition = { type: 'just' };
    } else {
      transition =
        transitionProp[valueKey] || (transitionProp as TransitionMap).default;
    }

    return { ...transition, to };
  }

  return getDefaultTransition(valueKey, to);
};

const preprocessOptions = (type: string, opts: Transition): Transition =>
  transitionOptionParser[type] ? transitionOptionParser[type](opts) : opts;

export default (
  valueKey: string,
  to: string | number,
  transition?: TransitionProp
): [ActionFactory, Transition] => {
  const { type = 'tween', ...transitionDefinition } = getTransition(
    valueKey,
    to,
    transition
  );

  const action: ActionFactory = transitions[type];
  const opts: Transition = preprocessOptions(type, transitionDefinition);

  return [action, opts];
};
