import { useMemo, useRef, MutableRefObject } from 'react';
import { MotionValue } from '../motion-value';
import { interpolate } from '@popmotion/popcorn';

export default (
  value: MotionValue,
  from: number[],
  to: string[] | number[]
) => {
  const transformedValue: MutableRefObject<null | MotionValue> = useRef(null);

  return useMemo(
    () => {
      if (transformedValue.current) transformedValue.current.destroy();
      transformedValue.current = value.addChild({
        transformer: interpolate(from, to)
      });
      return transformedValue.current;
    },
    [value, ...from, ...to]
  );
};
