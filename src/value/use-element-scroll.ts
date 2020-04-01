import { motionValue } from '.';
import { useCallback, useEffect, useRef } from 'react';

const scrollTop = motionValue(0);

export default function () {
  const scrollRef = useRef<HTMLDivElement>(null);
  const element = scrollRef?.current;
  const elementInnerHeight = scrollRef?.current?.scrollHeight ?? 0;
  
  const updateScrollValues = useCallback(
    (event: Event) => {
      const el = event.target as HTMLDivElement;
      scrollTop.set(el.scrollTop / elementInnerHeight);
    },
    [elementInnerHeight]
  );
  
  useEffect(() => {
    if (element) {
      element.addEventListener('resize', updateScrollValues);
      element.addEventListener('scroll', updateScrollValues, { passive: true });
      
      return () => {
        element.removeEventListener('resize', updateScrollValues);
        element.removeEventListener('scroll', updateScrollValues);
      };
    }
    return () => true;
  }, [element, updateScrollValues]);
  return { scrollRef, scrollTop };
}
