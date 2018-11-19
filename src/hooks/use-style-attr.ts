import { useMemo, CSSProperties } from 'react';
import { buildStyleProperty } from 'stylefire';
import { MotionValue } from '../motion-value';

export default (styles: CSSProperties, values: Map<string, MotionValue>) =>
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
