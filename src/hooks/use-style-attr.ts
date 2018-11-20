import { useMemo, CSSProperties } from 'react';
import { buildStyleProperty } from 'stylefire';
import { MotionValue } from '../motion-value';

export default (
  values: Map<string, MotionValue>,
  styles?: CSSProperties
): CSSProperties =>
  useMemo(() => {
    const resolvedValues = {};
    values.forEach((value, key) => (resolvedValues[key] = value.get()));

    return {
      ...styles,
      ...buildStyleProperty(resolvedValues)
    };
  }, []);
