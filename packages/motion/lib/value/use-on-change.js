import { useEffect } from "react";
import { isMotionValue } from "./utils/is-motion-value";
export function useOnChange(value, callback) {
    useEffect(function () {
        if (isMotionValue(value))
            return value.onChange(callback);
    }, [callback]);
}
export function useMultiOnChange(values, handler) {
    useEffect(function () {
        var subscriptions = values.map(function (value) { return value.onChange(handler); });
        return function () { return subscriptions.forEach(function (unsubscribe) { return unsubscribe(); }); };
    });
}
//# sourceMappingURL=use-on-change.js.map