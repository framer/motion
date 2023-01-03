import { motionComponentSymbol } from "./symbol"

/**
 * Checks if a component is a `motion` component.
 */
export function isMotionComponent(component: React.ComponentType | string) {
    return (
        component !== null &&
        typeof component === "object" &&
        motionComponentSymbol in component
    )
}
