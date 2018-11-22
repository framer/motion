import { MotionValue } from '../motion-value';
import { CSSProperties, ComponentType, Ref } from 'react';

export type ComponentFactory<T> = (
  config?: PoseConfigFactory | PoseConfig
) => ComponentType<T>;

export type PoseConfigFactory = (props: MotionProps) => PoseConfig;

export type PoseConfig = {
  [key: string]: Pose | PoseResolver;
};

export type MotionProps = {
  [key: string]: any;
  ref?: Ref<any>;
  pose?: string | string[] | MotionValue;
  style?: CSSProperties;
  onPoseComplete?: (current: CurrentValues, velocity: VelocityValues) => void;
};

export type EasingFunction = (v: number) => number;

export type CubicBezier = [number, number, number, number];

export type Easing =
  | CubicBezier
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circIn'
  | 'circOut'
  | 'circInOut'
  | 'backIn'
  | 'backOut'
  | 'backInOut'
  | 'anticipate'
  | EasingFunction;

export type BaseTransition = {
  delay?: number;
  from?: number | string;
  to?: number | string;
  velocity?: number;
};

export type Tween = BaseTransition & {
  type?: 'tween';
  duration?: number;
  ease?: Easing;
  elapsed?: number;
  loop?: number;
  flip?: number;
  yoyo?: number;
};

export type Spring = BaseTransition & {
  type: 'spring';
  stiffness?: number;
  damping?: number;
  mass?: number;
  restSpeed?: number;
  restDelta?: number;
};

export type Decay = BaseTransition & {
  type: 'decay';
  modifyTarget?: (v: number) => number;
  power?: number;
  timeConstant?: number;
  restDelta?: number;
};

export type Keyframes = BaseTransition & {
  type: 'keyframes';
  values: number[] | string[];
  easings?: Easing[];
  easeAll?: Easing;
  elapsed?: number;
  duration?: number;
  loop?: number;
  flip?: number;
  yoyo?: number;
};

export type Physics = BaseTransition & {
  type: 'physics';
  acceleration?: number;
  friction?: number;
  restSpeed?: number | false;
};

export type Just = BaseTransition & {
  type: 'just';
};

export type TransitionProp =
  | Tween
  | Spring
  | Decay
  | Keyframes
  | Physics
  | BaseTransition
  | false;

export type Transition = Tween | Spring | Decay | Keyframes | Physics | Just;

export type TransitionMap = { [key: string]: TransitionProp };

export type TransitionDefinition = TransitionProp | TransitionMap;

// Framer Motion accepts any value, not just those listed below.
// Add more here as found.
export type Pose = {
  // Transforms
  x?: number | string;
  y?: number | string;
  z?: number | string;
  rotate?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  scale?: number | string;
  scaleX?: number | string;
  scaleY?: number | string;
  scaleZ?: number | string;
  skew?: number | string;
  skewX?: number | string;
  skewY?: number | string;
  originX?: number | string;
  originY?: number | string;
  originZ?: number | string;
  opacity?: number;
  perspective?: number | string;
  transform?: string;

  // Positioning
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;

  // Spacing
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;

  // Borders
  borderColor?: number | string;
  borderTopColor?: number | string;
  borderRightColor?: number | string;
  borderBottomColor?: number | string;
  borderLeftColor?: number | string;
  borderWidth?: number | string;
  borderTopWidth?: number | string;
  borderRightWidth?: number | string;
  borderBottomWidth?: number | string;
  borderLeftWidth?: number | string;
  borderRadius?: number | string;
  borderTopLeftRadius?: number | string;
  borderTopRightRadius?: number | string;
  borderBottomRightRadius?: number | string;
  borderBottomLeftRadius?: number | string;

  // Colors
  color?: string;
  backgroundColor?: string;
  outlineColor?: string;
  fill?: string;
  stroke?: string;

  // Misc
  background?: string;
  backgroundImage?: string;

  // SVG
  d?: string;
  pathLength?: number;
  pathSpacing?: number;

  // Options
  transition?: TransitionDefinition;
  transitionEnd?: StyleProps | ResolveStyleProps;
};

export type ResolveStyleProps = (
  current: CurrentValues,
  velocity: VelocityValues
) => StyleProps;

export type StyleProps = { [key: string]: string | number };

export type CurrentValues = { [key: string]: string | number };
export type VelocityValues = { [key: string]: number };

export type PoseResolver = (
  props: { [key: string]: any },
  current: CurrentValues,
  velocity: VelocityValues
) => Pose;

export type MotionValueMap = Map<string, MotionValue>;
