import { __read } from "tslib";
import sync from "framesync";
import { useState, useCallback, useRef } from "react";
import { useUnmountEffect } from "./use-unmount-effect";
export function useForceUpdate() {
    var isUnmountingRef = useRef(false);
    var _a = __read(useState(0), 2), forcedRenderCount = _a[0], setForcedRenderCount = _a[1];
    useUnmountEffect(function () { return (isUnmountingRef.current = true); });
    var forceRender = useCallback(function () {
        !isUnmountingRef.current && setForcedRenderCount(forcedRenderCount + 1);
    }, [forcedRenderCount]);
    /**
     * Defer this to the end of the next animation frame in case there are multiple
     * synchronous calls.
     */
    var deferredForceRender = useCallback(function () { return sync.postRender(forceRender); }, [forceRender]);
    return [deferredForceRender, forcedRenderCount];
}
//# sourceMappingURL=use-force-update.js.map