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

    /**
     * `transition` settings to use for the animate animation. Currently, only one transition
     * can be defined for every animating value and every animating component.
     *
     * @internal
     */
    _transition?: Transition

    /**
     * By default, `SharedLayoutProps` will run a animate animation on all children every time
     * it renders.
     *
     * To improve performance we can pass a variable to `dependency`, like a piece of state or a URL.
     * `SharedLayoutProps` will only run animate animations when this dependency changes.
     *
     * TODO: Potentially replace this with a shouldAnimate
     *
     * @internal
     */
    _dependency?: any

    /**
     * Currently, transforms intefere with Magic Motion measurements. There may be a future
     * iteration where `translate` and `scale` are measured and incorporated as these
     * can be reverse-applied to a measured bounding box.
     *
     * `rotate` is different in that it can't easily be reverse engineered from a measured bounding box.
     * Setting `supportRotate` to `true` adds another write cycle to Magic Motion before the origin
     * snapshot that resets rotate to `0`. It's then read from `style={{ rotate }}` and animated seperately.
     *
     * This isn't for general consumption and is only intended for use within Framer where the
     * rotate control is prominent.
     *
     * @internal
     */
    _supportRotate?: boolean
}

export interface SharedLayoutAnimationConfig {
    visibilityAction?: VisibilityAction
    originBox?: AxisBox2D
    targetBox?: AxisBox2D
    transition?: Transition
    crossfadeOpacity?: MotionValue<number>
    onLayoutAnimationComplete?: () => void
}
