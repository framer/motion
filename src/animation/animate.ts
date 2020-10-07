import { Transition } from "../types"
import { motionValue, MotionValue } from "../value"
import { isMotionValue } from "../value/utils/is-motion-value"
import { startAnimation } from "./utils/transitions"

interface PlaybackControls {
    stop: () => void
}

interface PlaybackLifecycles<V> {
    onUpdate?: (latest: V) => void
    onPlay?: () => void
    onComplete?: () => void
    onRepeat?: () => void
    onStop?: () => void
}

/**
 * Animate a value or a `MotionValue`.
 *
 * Returns `PlaybackControls`, currently a `stop` method.
 *
 * ```javascript
 * const x = useMotionValue(0)
 *
 * useEffect(() => {
 *   const controls = animate(x, 100, {
 *     type: "spring",
 *     stiffness: 2000,
 *     onComplete: v => {}
 *   })
 *
 *   return controls.stop
 * })
 * ```
 */
export function animate<V>(
    from: MotionValue<V> | V,
    to: V | V[],
    {
        onStop,
        onComplete,
        ...transition
    }: Transition & PlaybackLifecycles<V> = {},
    onChange?: (v: V) => void
): PlaybackControls {
    const value = isMotionValue(from) ? from : motionValue(from)
    const unsubscribe = onChange && value.onChange(onChange)

    transition.onStop = () => {
        unsubscribe?.()
        onStop?.()
    }

    transition.onComplete = () => {
        unsubscribe?.()
        onComplete?.()
    }

    startAnimation("", value, to as any, transition)

    return {
        stop: () => value.stop(),
    }
}
