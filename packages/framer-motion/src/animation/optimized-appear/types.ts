export type MotionAppearAnimations = Map<string, Animation>

/**
 * The window global object acts as a bridge between our inline script
 * triggering the optimized appear animations, and Framer Motion.
 */
declare global {
    interface Window {
        MotionAppearAnimations?: MotionAppearAnimations
    }
}
