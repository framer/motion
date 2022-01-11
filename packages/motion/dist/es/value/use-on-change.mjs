import { useEffect } from 'react';
import { isMotionValue } from './utils/is-motion-value.mjs';

function useOnChange(value, callback) {
    useEffect(function () {
        if (isMotionValue(value))
            return value.onChange(callback);
    }, [callback]);
}
function useMultiOnChange(values, handler) {
    useEffect(function () {
        var subscriptions = values.map(function (value) { return value.onChange(handler); });
        return function () { return subscriptions.forEach(function (unsubscribe) { return unsubscribe(); }); };
    });
}

export { useMultiOnChange, useOnChange };
