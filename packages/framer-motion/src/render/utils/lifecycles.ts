import { MotionProps } from "../../motion/types"
import { Axis, Box, Delta } from "../../projection/geometry/types"
import { SubscriptionManager } from "../../utils/subscription-manager"
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
    "LayoutAnimationStart",
    "SetAxisTarget",
    "Unmount",
]

export type LayoutMeasureListener = (layout: Box, prevLayout?: Box) => void
export type BeforeLayoutMeasureListener = () => void
export type LayoutUpdateListener = (layout: Axis, prevLayout: Axis) => void
export type UpdateListener = (latest: ResolvedValues) => void
export type AnimationStartListener = (definition: AnimationDefinition) => void
export type AnimationCompleteListener = (
    definition: AnimationDefinition
) => void
export type LayoutAnimationStartListener = () => void
export type LayoutAnimationCompleteListener = () => void
export type SetAxisTargetListener = () => void
export type RenderListener = () => void
export type OnViewportBoxUpdate = (box: Axis, delta: Delta) => void

export interface LayoutLifecycles {
    onBeforeLayoutMeasure?(box: Box): void

    onLayoutMeasure?(box: Box, prevBox: Box): void

    /**
     * @internal
     */
    onLayoutAnimationStart?(): void

    /**
     * @internal
     */
    onLayoutAnimationComplete?(): void
}

export interface AnimationLifecycles {
    /**
     * Callback with latest motion values, fired max once per frame.
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
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has started.
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(definition: AnimationDefinition): void

    /**
     * Callback when animation defined in `animate` is complete.
     *
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has completed.
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
    onUnmount?(): void
}

export type VisualElementLifecycles = LayoutLifecycles & AnimationLifecycles

export interface LifecycleManager {
    onLayoutMeasure: (callback: LayoutMeasureListener) => () => void
    notifyLayoutMeasure: LayoutMeasureListener
    onBeforeLayoutMeasure: (callback: BeforeLayoutMeasureListener) => () => void
    notifyBeforeLayoutMeasure: BeforeLayoutMeasureListener
    onLayoutUpdate: (callback: LayoutUpdateListener) => () => void
    notifyLayoutUpdate: LayoutUpdateListener
    onUpdate: (callback: UpdateListener) => () => void
    notifyUpdate: UpdateListener
    onAnimationStart: (callback: AnimationStartListener) => () => void
    notifyAnimationStart: AnimationStartListener
    onAnimationComplete: (callback: AnimationCompleteListener) => () => void
    notifyAnimationComplete: AnimationCompleteListener
    onLayoutAnimationStart: (
        callback: LayoutAnimationStartListener
    ) => () => void
    notifyLayoutAnimationStart: LayoutAnimationStartListener
    onLayoutAnimationComplete: (
        callback: LayoutAnimationCompleteListener
    ) => () => void
    notifyLayoutAnimationComplete: LayoutAnimationCompleteListener
    onSetAxisTarget: (callback: SetAxisTargetListener) => () => void
    notifySetAxisTarget: SetAxisTargetListener
    onRender: (callback: RenderListener) => () => void
    notifyRender: RenderListener
    onUnmount: (callback: () => void) => () => void
    notifyUnmount: () => void
    clearAllListeners: () => void
    updatePropListeners: (props: MotionProps) => void
}

export function createLifecycles() {
    const managers = names.map(() => new SubscriptionManager())
    const propSubscriptions: { [key: string]: () => {} } = {}
    const lifecycles: Partial<LifecycleManager> = {
        clearAllListeners: () => managers.forEach((manager) => manager.clear()),
        updatePropListeners: (props) => {
            names.forEach((name) => {
                const on = "on" + name
                const propListener = props[on]

                // Unsubscribe existing subscription
                propSubscriptions[name]?.()

                // Add new subscription
                if (propListener) {
                    propSubscriptions[name] = lifecycles[on](propListener)
                }
            })
        },
    }

    managers.forEach((manager, i) => {
        lifecycles["on" + names[i]] = (handler: any) => manager.add(handler)
        lifecycles["notify" + names[i]] = (...args: any) =>
            manager.notify(...args)
    })

    return lifecycles as LifecycleManager
}
