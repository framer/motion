import { isMotionComponent } from "./is-motion-component"
import { motionComponentSymbol } from "./symbol"

/**
 * Unwraps a `motion` component and returns either a string for `motion.div` or
 * the React component for `motion(Component)`.
 *
 * If the component is not a `motion` component it returns undefined.
 */
export function unwrapMotionComponent(
    component: React.ComponentType | string
): React.ComponentType | string | undefined {
    if (isMotionComponent(component)) {
        return component[motionComponentSymbol]
    }

    return undefined
}
