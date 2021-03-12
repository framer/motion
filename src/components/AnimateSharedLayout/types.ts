import { VisualElement } from "../../render/types"
import { Transition } from "../../types"
import { AxisBox2D } from "../../types/geometry"
import { MotionValue } from "../../value"

export enum Presence {
    Entering,
    Present,
    Exiting,
}

export enum VisibilityAction {
    Hide,
    Show,
}

export interface SharedLayoutProps {
    /**
     * @public
     */
    children: React.ReactNode

    /**
     * When combined with `AnimatePresence`, `SharedLayoutProps` can customise how to visually switch
     * between `layoutId` components as new ones enter and leave the tree.
     *
     * - "switch" (default): The old `layoutId` component will be hidden instantly when a new one enters, and
     * the new one will perform the full transition. When the newest one is removed, it will perform
     * the full exit transition and then the old component will be shown instantly.
     * - "crossfade": The root shared components will crossfade as `layoutId` children of both perform
     * the same transition.
     *
     * @public
     */
    type?: "switch" | "crossfade"
}

export interface SharedLayoutAnimationConfig {
    visibilityAction?: VisibilityAction
    originBox?: AxisBox2D
    targetBox?: AxisBox2D
    transition?: Transition
    crossfadeOpacity?: MotionValue<number>
    shouldStackAnimate?: boolean
    onComplete?: () => void
}

/**
 * Handlers for batching sync layout lifecycles. We batches these processes to cut
 * down on layout thrashing
 */
export interface SyncLayoutLifecycles {
    measureLayout: (child: VisualElement) => void
    layoutReady: (child: VisualElement) => void
    parent?: VisualElement
}

/**
 * The exposed API for children to add themselves to the batcher and to flush it.
 */
export interface SyncLayoutBatcher {
    add: (child: VisualElement) => void
    flush: (handler?: SyncLayoutLifecycles) => void
}

/**
 * Extra API methods available to children if they're a descendant of AnimateSharedLayout
 */
export interface SharedLayoutSyncMethods extends SyncLayoutBatcher {
    syncUpdate: (force?: boolean) => void
    forceUpdate: () => void
    register: (child: VisualElement) => void
    remove: (child: VisualElement) => void
}
