import { MotionValue } from '../motion-value';
import { RefObject, CSSProperties, ComponentType } from 'react';

export type ComponentFactory = (
  config?: PoseConfigFactory | PoseConfig
) => ComponentType;

export type Motion = {
  (component: ComponentType): ComponentFactory;
  [key: string]: ComponentFactory;
};

export type PoseConfigFactory = (props: MotionProps) => PoseConfig;

export type PoseConfig = {
  [key: string]: Pose | PoseResolver;
};

export type MotionProps = {
  [key: string]: any;
  ref: RefObject<Element>;
  pose: string | string[] | MotionValue;
  style: CSSProperties;
};

export type EasingFunction = (v: number) => number;

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

export type Tween = {
  type?: 'tween';
  from?: number | string;
  to?: number | string;
  duration?: number;
  ease?: Easing;
  elapsed?: number;
  loop?: number;
  flip?: number;
  yoyo?: number;
};

export type Spring = {
  type: 'spring';
  from?: number | string;
  to?: number | string;
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  restSpeed?: number;
  restDelta?: number;
};

export type Decay = {
  type: 'decay';
  velocity?: number;
  from?: number | string;
  modifyTarget?: (v: number) => number;
  power?: number;
  timeConstant?: number;
  restDelta?: number;
};

export type CubicBezier = [number, number, number, number];

export type Keyframes = {
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

export type Physics = {
  type: 'physics';
  from?: number | string;
  acceleration?: number;
  friction?: number;
  velocity?: number;
  restSpeed?: number | false;
  to?: number | string;
};

export type Transition = Tween | Spring | Decay | Keyframes | Physics;

export type TransitionMap = { [key: string]: Transition };

export type TransitionDefinition = Transition | TransitionMap;

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

  // SVG
  d?: string;
  pathLength?: number;
  pathSpacing?: number;

  // Options
  transition?: TransitionDefinition;
  staggerDirection?: number;
  staggerChildren?: number;
};

export type PoseResolver = (props: { [key: string]: any }) => Pose;
