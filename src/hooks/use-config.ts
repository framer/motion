import { useMemo } from 'react';
import {
  MotionConfig,
  MotionConfigFactory,
  MotionProps
} from '../motion/types';

const isResolver = (
  config: MotionConfig | MotionConfigFactory
): config is MotionConfigFactory => typeof config === 'function';

const useConfig = (
  baseConfig: MotionConfig | MotionConfigFactory,
  props: MotionProps
) =>
  useMemo(() => (isResolver(baseConfig) ? baseConfig(props) : baseConfig), []);

export default useConfig;
