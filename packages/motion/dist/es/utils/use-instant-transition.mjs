import { __read } from 'tslib';
import sync from 'framesync';
import { useEffect } from 'react';
import { useInstantLayoutTransition } from '../projection/use-instant-layout-transition.mjs';
import { useForceUpdate } from './use-force-update.mjs';
import { instantAnimationState } from './use-instant-transition-state.mjs';

function useInstantTransition() {
    var _a = __read(useForceUpdate(), 2), forceUpdate = _a[0], forcedRenderCount = _a[1];
    var startInstantLayoutTransition = useInstantLayoutTransition();
    useEffect(function () {
        /**
         * Unblock after two animation frames, otherwise this will unblock too soon.
         */
        sync.postRender(function () {
            return sync.postRender(function () { return (instantAnimationState.current = false); });
        });
    }, [forcedRenderCount]);
    return function (callback) {
        startInstantLayoutTransition(function () {
            instantAnimationState.current = true;
            forceUpdate();
            callback();
        });
    };
}

export { useInstantTransition };
