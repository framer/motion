import { useMemo, CSSProperties } from 'react';
import { buildStyleProperty } from 'stylefire';
import { MotionValue } from '../motion-value';

export default (
  values: Map<string, MotionValue>,
  styles?: CSSProperties
): CSSProperties =>
  useMemo(() => {
    const resolvedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key].get();
      return acc;
    }, {});

    return {
      ...styles,
      ...buildStyleProperty(resolvedValues)
    };
  }, []);
