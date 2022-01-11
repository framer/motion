import { __read } from 'tslib';
import { useContext, useState, useEffect } from 'react';
import { motionValue } from './index.mjs';
import { MotionConfigContext } from '../context/MotionConfigContext.mjs';
import { useConstant } from '../utils/use-constant.mjs';

/**
 * Creates a `MotionValue` to track the state and velocity of a value.
 *
 * Usually, these are created automatically. For advanced use-cases, like use with `useTransform`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const scale = useMotionValue(1)
 *
 *   return <motion.div style={{ scale }} />
 * }
 * ```
 *
 * @param initial - The initial state.
 *
 * @public
 */
function useMotionValue(initial) {
    var value = useConstant(function () { return motionValue(initial); });
    /**
     * If this motion value is being used in static mode, like on
     * the Framer canvas, force components to rerender when the motion
     * value is updated.
     */
    var isStatic = useContext(MotionConfigContext).isStatic;
    if (isStatic) {
        var _a = __read(useState(initial), 2), setLatest_1 = _a[1];
        useEffect(function () { return value.onChange(setLatest_1); }, []);
    }
    return value;
}

export { useMotionValue };
