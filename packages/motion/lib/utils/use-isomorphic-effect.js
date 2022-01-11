import { useEffect, useLayoutEffect } from "react";
import { isBrowser } from "./is-browser";
export var useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
//# sourceMappingURL=use-isomorphic-effect.js.map