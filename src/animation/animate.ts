import { Spring, Tween } from "../types"
import { motionValue, MotionValue } from "../value"
import { isMotionValue } from "../value/utils/is-motion-value"
import { startAnimation } from "./utils/transitions"

/**
 * @public
 */
export interface AnimationPlaybackControls {
    stop: () => void
}

/**
 * @public
 */
export interface AnimationPlaybackLifecycles<V> {
    onUpdate?: (latest: V) => void
    onPlay?: () => void
    onComplete?: () => void
    onRepeat?: () => void
    onStop?: () => void
}

/**
 * @public
 */
export type AnimationOptions<V> = (Tween | Spring) &
    AnimationPlaybackLifecycles<V> & {
        delay?: number
        type?: "tween" | "spring"
    }

/**
 * Animate a single value or a `MotionValue`.
 *
 * The first argument is either a `MotionValue` to animate, or an initial animation value.
 *
 * The second is either a value to animate to, or an array of keyframes to animate through.
 *
 * The third argument can be either tween or spring options, and optional lifecycle methods: `onUpdate`, `onPlay`, `onComplete`, `onRepeat` and `onStop`.
 *
 * Returns `AnimationPlaybackControls`, currently just a `stop` method.
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
 *
 * @public
 */
export function animate<V>(
    from: MotionValue<V> | V,
    to: V | V[],
    transition: AnimationOptions<V> = {}
): AnimationPlaybackControls {
    const value = isMotionValue(from) ? from : motionValue(from)
    startAnimation("", value, to as any, transition)

    return {
        stop: () => value.stop(),
    }
}
