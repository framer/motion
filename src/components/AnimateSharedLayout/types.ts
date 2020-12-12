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
}
