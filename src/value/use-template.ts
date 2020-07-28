import { useEffect } from "react"
import sync from "framesync"
import { MotionValue } from "."
import { useMotionValue } from "./use-motion-value"

/**
 * Combine multiple motion values into a new one using a string template literal.
 *
 * ```jsx
 * import {
 *   motion,
 *   useSpring,
 *   useMotionValue,
 *   useTemplate
 * } from "framer-motion"
 *
 * function Component() {
 *   const shadowX = useSpring(0)
 *   const shadowY = useMotionValue(0)
 *   const shadow = useTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`
 *
 *   return <motion.div style={{ filter: shadow }} />
 * }
 * ```
 *
 * @public
 */
export function useTemplate(
    fragments: TemplateStringsArray,
    ...values: MotionValue[]
) {
    /**
     * Create a function that will build a string from the latest motion values.
     */
    const numFragments = fragments.length
    function buildValue() {
        let output = ``

        for (let i = 0; i < numFragments; i++) {
            output += fragments[i]
            const value = values[i]
            if (value) output += values[i].get()
        }

        return output
    }

    /**
     * Initialise the returned motion value. This remains the same between renders.
     */
    const value = useMotionValue(buildValue())

    /**
     * Create a function that will update the template motion value with the latest values.
     * This is pre-bound so whenever a motion value updates it can schedule its
     * execution in Framesync. If it's already been scheduled it won't be fired twice
     * in a single frame.
     */
    const updateValue = () => value.set(buildValue())

    /**
     * Synchronously update the motion value with the latest values during the render.
     * This ensures that within a React render, the styles applied to the DOM are up-to-date.
     */
    updateValue()

    /**
     * Subscribe to all motion values found within the template. Whenever any of them change,
     * schedule an update.
     */
    useSubscriptions(values, () => sync.update(updateValue, false, true))

    return value
}

function useSubscriptions(values: MotionValue[], handler: () => void) {
    useEffect(() => {
        const subscriptions = values.map(value => value.onChange(handler))
        return () => subscriptions.forEach(unsubscribe => unsubscribe())
    })
}
