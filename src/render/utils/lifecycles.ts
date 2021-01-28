import { SharedLayoutAnimationConfig } from "../../components/AnimateSharedLayout/types"
import { MotionProps } from "../../motion/types"
import { AxisBox2D } from "../../types/geometry"
import { subscriptionManager } from "../../utils/subscription-manager"
import { ResolvedValues } from "../types"

const names = [
    "LayoutMeasure",
    "LayoutUpdate",
    "ViewportBoxUpdate",
    "Update",
    "Render",
    "AnimationComplete",
    "AnimationStart",
    "SetAxisTarget",
]

export type LayoutMeasureListener = (
    layout: AxisBox2D,
    prevLayout: AxisBox2D
) => void
export type LayoutUpdateListener = (
    layout: AxisBox2D,
    prevLayout: AxisBox2D,
    config?: SharedLayoutAnimationConfig
) => void
export type ViewportBoxListener = (box: AxisBox2D) => void
export type UpdateListener = (latest: ResolvedValues) => void
export type AnimationStartListener = () => void
export type AnimationCompleteListener = () => void
export type SetAxisTargetListener = () => void
export type RenderListener = () => void

export interface LifecycleManager {
    onLayoutMeasure: (callback: LayoutMeasureListener) => () => void
    notifyLayoutMeasure: LayoutMeasureListener
    onLayoutUpdate: (callback: LayoutUpdateListener) => () => void
    notifyLayoutUpdate: LayoutUpdateListener
    onViewportBoxUpdate: (callback: ViewportBoxListener) => () => void
    notifyViewportBoxUpdate: ViewportBoxListener
    onUpdate: (callback: UpdateListener) => () => void
    notifyUpdate: UpdateListener
    onAnimationStart: (callback: AnimationStartListener) => () => void
    notifyAnimationStart: AnimationStartListener
    onAnimationComplete: (callback: AnimationCompleteListener) => () => void
    notifyAnimationComplete: AnimationCompleteListener
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
