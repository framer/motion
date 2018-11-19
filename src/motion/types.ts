import { MotionValue } from '../motion-value';

export type MotionProps = {
  pose: string | string[] | MotionValue;
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

export type MotionConfig = {
  [key: string]: Pose | PoseResolver;
};

export type MotionConfigResolver = (props: MotionProps) => MotionConfig;
