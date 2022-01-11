import sync, { cancelSync } from "framesync";
import { useEffect } from "react";
import { useConstant } from "./use-constant";
var getCurrentTime = typeof performance !== "undefined"
    ? function () { return performance.now(); }
    : function () { return Date.now(); };
export function useAnimationFrame(callback) {
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
//# sourceMappingURL=use-animation-frame.js.map