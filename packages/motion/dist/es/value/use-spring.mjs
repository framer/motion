import { __assign } from 'tslib';
import { useContext, useRef, useMemo } from 'react';
import { animate } from 'popmotion';
import { isMotionValue } from './utils/is-motion-value.mjs';
import { useMotionValue } from './use-motion-value.mjs';
import { useOnChange } from './use-on-change.mjs';
import { MotionConfigContext } from '../context/MotionConfigContext.mjs';

/**
 * Creates a `MotionValue` that, when `set`, will use a spring animation to animate to its new state.
 *
 * It can either work as a stand-alone `MotionValue` by initialising it with a value, or as a subscriber
 * to another `MotionValue`.
 *
 * @remarks
 *
 * ```jsx
 * const x = useSpring(0, { stiffness: 300 })
 * const y = useSpring(x, { damping: 10 })
 * ```
 *
 * @param inputValue - `MotionValue` or number. If provided a `MotionValue`, when the input `MotionValue` changes, the created `MotionValue` will spring towards that value.
 * @param springConfig - Configuration options for the spring.
 * @returns `MotionValue`
 *
 * @public
 */
function useSpring(source, config) {
    if (config === void 0) { config = {}; }
    var isStatic = useContext(MotionConfigContext).isStatic;
    var activeSpringAnimation = useRef(null);
    var value = useMotionValue(isMotionValue(source) ? source.get() : source);
    useMemo(function () {
        return value.attach(function (v, set) {
            /**
             * A more hollistic approach to this might be to use isStatic to fix VisualElement animations
             * at that level, but this will work for now
             */
            if (isStatic)
                return set(v);
            if (activeSpringAnimation.current) {
                activeSpringAnimation.current.stop();
            }
            activeSpringAnimation.current = animate(__assign(__assign({ from: value.get(), to: v, velocity: value.getVelocity() }, config), { onUpdate: set }));
            return value.get();
        });
    }, Object.values(config));
    useOnChange(source, function (v) { return value.set(parseFloat(v)); });
    return value;
}

export { useSpring };
