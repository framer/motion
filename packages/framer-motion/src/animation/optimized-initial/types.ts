export type MotionAppearAnimations = Map<string, Animation>

declare global {
    interface Window {
        MotionAppearAnimations?: MotionAppearAnimations
    }
}
