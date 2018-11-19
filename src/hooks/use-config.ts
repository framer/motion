import { useMemo } from 'react';
import {
  MotionConfig,
  MotionConfigResolver,
  MotionProps
} from '../motion/types';

const isResolver = (
  config: MotionConfig | MotionConfigResolver
): config is MotionConfigResolver => typeof config === 'function';

const useConfig = (
  baseConfig: MotionConfig | MotionConfigResolver,
  props: MotionProps
) =>
  useMemo(() => (isResolver(baseConfig) ? baseConfig(props) : baseConfig), []);

export default useConfig;
