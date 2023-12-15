export type HandoffFunction = (
    storeId: string,
    valueName: string
) => null | number

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        HandoffAppearAnimations?: HandoffFunction
        HandoffComplete?: boolean
    }
}
