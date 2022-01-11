import { useLayoutEffect, useEffect } from 'react';
import { isBrowser } from './is-browser.mjs';

var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export { useIsomorphicLayoutEffect };
