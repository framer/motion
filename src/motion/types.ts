import { MotionValue } from '../motion-value';

export type MotionProps = {
  pose: string | string[] | MotionValue;
};

export type Pose = {
  [key: string]: number | string;
};

export type PoseResolver = (props: { [key: string]: any }) => Pose;

export type MotionConfig = {
  [key: string]: Pose | PoseResolver;
};

export type MotionConfigResolver = (props: MotionProps) => MotionConfig;
