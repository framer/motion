import sync, { cancelSync } from 'framesync';
import { useEffect } from 'react';
import { useConstant } from './use-constant.mjs';

var getCurrentTime = typeof performance !== "undefined"
    ? function () { return performance.now(); }
    : function () { return Date.now(); };
function useAnimationFrame(callback) {
    var initialTimestamp = useConstant(getCurrentTime);
    useEffect(function () {
        var provideTimeSinceStart = function (_a) {
            var timestamp = _a.timestamp;
            callback(timestamp - initialTimestamp);
        };
        sync.update(provideTimeSinceStart, true);
        return function () { return cancelSync.update(provideTimeSinceStart); };
    }, [callback]);
}

export { useAnimationFrame };
