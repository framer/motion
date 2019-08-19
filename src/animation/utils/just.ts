import { Action, action, delay } from "popmotion"

interface JustProps {
    to?: string | number
    duration?: number
}

/**
 * A Popmotion action that accepts a single `to` prop. When it starts, it immediately
 * updates with `to` and then completes. By using this we can compose instant transitions
 * in with the same logic that applies `delay` or returns a `Promise` etc.
 *
 * Accepting `duration` is a little bit of a hack that simply defers the completetion of
 * the animation until after the duration finishes. This is for situations when you're **only**
 * animating non-animatable values and then setting something on `transitionEnd`. Really
 * you want this to fire after the "animation" finishes, rather than instantly.
 *
 * ```
 * animate={{
 *   display: 'block',
 *   transitionEnd: { display: 'none' }
 * }}
 * ```
 */
export const just = ({ to, duration }: JustProps): Action => {
    return action(({ update, complete }) => {
        update(to)
        duration ? delay(duration).start({ complete }) : complete()
    })
}
