import { memo, forwardRef, createElement, Ref, ComponentType } from 'react';
import { MotionProps, ComponentFactory } from './types';
import useConfig from '../hooks/use-config';
import useExternalRef from '../hooks/use-external-ref';
import usePosedValues from '../hooks/use-posed-values';
import usePoseResolver from '../hooks/use-pose-resolver';
import useStyleAttr from '../hooks/use-style-attr';

// TODO: tighten component type checking
type Props = { [key: string]: any };

const createMotionComponent = (
  Component: string | ComponentType
): ComponentFactory => (poseConfig = {}) => {
  const MotionComponent = (props: MotionProps, externalRef?: Ref<Element>) => {
    const ref = useExternalRef(externalRef);
    const config = useConfig(poseConfig, props);

    // Create motion values
    const [values, componentProps] = usePosedValues(config, props, ref);

    usePoseResolver(values, config, props, ref);

    return createElement<Props>(Component, {
      ...componentProps,
      ref,
      style: useStyleAttr(values, props.style)
    });
  };

  return memo(forwardRef(MotionComponent));
};

export default createMotionComponent;
