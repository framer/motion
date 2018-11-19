import { memo, forwardRef, createElement, Ref, ComponentType } from 'react';
import { MotionProps, MotionConfig, MotionConfigResolver } from './types';
import useConfig from '../hooks/use-config';
import useExternalRef from '../hooks/use-external-ref';
import usePosedValues from '../hooks/use-posed-values';
import usePoseResolver from '../hooks/use-pose-resolver';
import useStyleAttr from '../hooks/use-style-attr';

const createMotionComponent = <P extends object>(
  Component: ComponentType<P> | string
) => (motionConfig: MotionConfig | MotionConfigResolver) => {
  const MotionComponent = forwardRef(
    (props: P & MotionProps, externalRef?: Ref<Element>) => {
      const ref = useExternalRef(externalRef);
      const config = useConfig(motionConfig, props);

      // Create motion values
      const [values, componentProps] = usePosedValues<P>(config, props, ref);

      usePoseResolver(values, config, props);

      return createElement(Component, {
        ref,
        ...componentProps,
        style: useStyleAttr(props.styles, values)
      });
    }
  );

  return memo(MotionComponent);
};

export default createMotionComponent;
