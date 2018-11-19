import { useMemo } from 'react';
import motionValue from '../motion-value';

export default (init: number | string) => useMemo(() => motionValue(init), []);
