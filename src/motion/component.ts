import {
  memo,
  forwardRef,
  createElement,
  Ref,
  ComponentType,
  HTMLProps,
  SVGProps
} from 'react';
import { MotionProps, ComponentFactory } from './types';
import useConfig from '../hooks/use-config';
import useExternalRef from '../hooks/use-external-ref';
import usePosedValues from '../hooks/use-posed-values';
import usePoseResolver from '../hooks/use-pose-resolver';
import useStyleAttr from '../hooks/use-style-attr';

const createMotionComponent = (
  Component: string | ComponentType
): ComponentFactory => (PoseConfig = {}) => {
  const MotionComponent = forwardRef(
    (props: MotionProps, externalRef?: Ref<Element>) => {
      const ref = useExternalRef(externalRef);
      const config = useConfig(PoseConfig, props);

      // Create motion values
      const [values, componentProps] = usePosedValues(config, props, ref);

      usePoseResolver(values, config, props, ref);

      // Types here are a bit of a hack
      return createElement<HTMLProps<any> | SVGProps<any> & MotionProps>(
        Component,
        {
          ref,
          ...componentProps,
          style: useStyleAttr(values, props.style)
        }
      );
    }
  );

  return memo(MotionComponent);
};

export default createMotionComponent;
