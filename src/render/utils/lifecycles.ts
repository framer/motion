import { SharedLayoutAnimationConfig } from "../../components/AnimateSharedLayout/types"
import { MotionProps } from "../../motion/types"
import { AxisBox2D, BoxDelta } from "../../types/geometry"
import { subscriptionManager } from "../../utils/subscription-manager"
import { ResolvedValues } from "../types"
import { AnimationDefinition } from "./animation"

const names = [
    "LayoutMeasure",
    "BeforeLayoutMeasure",
    "LayoutUpdate",
    "ViewportBoxUpdate",
    "Update",
    "Render",
    "AnimationComplete",
    "LayoutAnimationComplete",
    "AnimationStart",
    "SetAxisTarget",
]

export type LayoutMeasureListener = (
    layout: AxisBox2D,
    prevLayout: AxisBox2D
) => void
export type BeforeLayoutMeasureListener = (layout: AxisBox2D) => void
export type LayoutUpdateListener = (
    layout: AxisBox2D,
    prevLayout: AxisBox2D,
    config?: SharedLayoutAnimationConfig
) => void
export type UpdateListener = (latest: ResolvedValues) => void
export type AnimationStartListener = () => void
export type AnimationCompleteListener = (
    definition: AnimationDefinition
) => void
export type LayoutAnimationCompleteListener = () => void
export type SetAxisTargetListener = () => void
export type RenderListener = () => void
export type OnViewportBoxUpdate = (box: AxisBox2D, delta: BoxDelta) => void

/**
 * TODO: Make more of these lifecycle events available as props
 */
export interface VisualElementLifecycles {
    /**
     * A callback that fires whenever the viewport-relative bounding box updates.
     *
     * @public
     */
    onViewportBoxUpdate?(box: AxisBox2D, delta: BoxDelta): void

    onBeforeLayoutMeasure?(box: AxisBox2D): void

    onLayoutMeasure?(box: AxisBox2D, prevBox: AxisBox2D): void

    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * @library
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <Frame animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: ResolvedValues): void

    /**
     * Callback when animation defined in `animate` begins.
     *
     * @library
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <Frame animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * The provided callback will be called the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has completed.
     *
     * @library
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <Frame
     *   animate={{ x: 100 }}
     *   onAnimationComplete={definition => {
     *     console.log('Completed animating', definition)
     *   }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div
     *   animate={{ x: 100 }}
     *   onAnimationComplete={definition => {
     *     console.log('Completed animating', definition)
     *   }}
     * />
     * ```
     */
    onAnimationComplete?(definition: AnimationDefinition): void

    /**
     * @internal
     */
    onLayoutAnimationComplete?(): void
}

export interface LifecycleManager {
    onLayoutMeasure: (callback: LayoutMeasureListener) => () => void
    notifyLayoutMeasure: LayoutMeasureListener
    onBeforeLayoutMeasure: (callback: BeforeLayoutMeasureListener) => () => void
    notifyBeforeLayoutMeasure: BeforeLayoutMeasureListener
    onLayoutUpdate: (callback: LayoutUpdateListener) => () => void
    notifyLayoutUpdate: LayoutUpdateListener
    onViewportBoxUpdate: (callback: OnViewportBoxUpdate) => () => void
    notifyViewportBoxUpdate: OnViewportBoxUpdate
    onUpdate: (callback: UpdateListener) => () => void
    notifyUpdate: UpdateListener
    onAnimationStart: (callback: AnimationStartListener) => () => void
    notifyAnimationStart: AnimationStartListener
    onAnimationComplete: (callback: AnimationCompleteListener) => () => void
    notifyAnimationComplete: AnimationCompleteListener
    onLayoutAnimationComplete: (
        callback: LayoutAnimationCompleteListener
    ) => () => void
    notifyLayoutAnimationComplete: LayoutAnimationCompleteListener
    onSetAxisTarget: (callback: SetAxisTargetListener) => () => void
    notifySetAxisTarget: SetAxisTargetListener
    onRender: (callback: RenderListener) => () => void
    notifyRender: RenderListener
    clearAllListeners: () => void
    updatePropListeners: (props: MotionProps) => void
}

export function createLifecycles() {
    const managers = names.map(subscriptionManager)
    const propSubscriptions: { [key: string]: () => {} } = {}
    const lifecycles: Partial<LifecycleManager> = {
        clearAllListeners: () => managers.forEach((manager) => manager.clear()),
        updatePropListeners: (props) =>
            names.forEach((name) => {
                propSubscriptions[name]?.()
                const on = "on" + name
                const propListener = props[on]
                if (propListener) {
                    propSubscriptions[name] = lifecycles[on](propListener)
                }
            }),
    }

    managers.forEach((manager, i) => {
        lifecycles["on" + names[i]] = manager.add
        lifecycles["notify" + names[i]] = manager.notify
    })

    return lifecycles as LifecycleManager
}
