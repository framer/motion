import { MotionValue } from '../motion-value';
import { RefObject, CSSProperties, ComponentType } from 'react';

export type MotionConfigFactory = (props: MotionProps) => MotionConfig;

export type ComponentFactory = (
  config?: MotionConfigFactory | MotionConfig
) => ComponentType;

export type Motion = {
  (component: ComponentType): ComponentFactory;
  [key: string]: ComponentFactory;
};

export type MotionConfig = {
  [key: string]: Pose | PoseResolver;
};

export type MotionProps = {
  [key: string]: any;
  ref: RefObject<Element>;
  pose: string | string[] | MotionValue;
  style: CSSProperties;
};

export type Tween = {};

export type Spring = {};

export type Decay = {};

export type Keyframes = {};

export type Physics = {};

export type Transition = Tween | Spring | Decay | Keyframes | Physics;

export type TransitionMap = { default?: Transition; [key: string]: Transition };

export type TransitionDefinition = Transition | TransitionMap;

export type PoseSettings = {
  transition?: TransitionDefinition;
  staggerDirection?: number;
  staggerChildren?: number;
};

export type Pose = PoseSettings & {
  [key: string]: number | string;
};

export type PoseResolver = (props: { [key: string]: any }) => Pose;
