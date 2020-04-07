import { Magic } from "./Magic"
import { Transition } from "../../../types"
import { Easing } from "@popmotion/easing"

/**
 * Description of a single axis. min/max is an abstraction of left/right top/bottom front/back
 */
export interface Axis {
    min: number
    max: number
}

/**
 * The transform delta that, when applied to Axis a will visually transform it to Axis b
 */
export interface AxisDelta {
    translate: number
    scale: number
    origin: number
    originPoint: number
}

/**
 * A description of a 2D box.
 */
export interface Box {
    x: Axis
    y: Axis
}

/**
 * The transform delta that, when applied to Box a will visually transform it to Box b.
 */
export interface BoxDelta {
    x: AxisDelta
    y: AxisDelta
}

/**
 * An array representing a split CSS box shadow as returned by getComputedStyle.
 * color/x/y/blur/spread
 */
export type BoxShadow = [string, number, number, number, number]

/**
 * The minimum expected styles supported by Magic Motion.
 */
export interface Style {
    backgroundColor: string
    borderTopLeftRadius: number
    borderTopRightRadius: number
    borderBottomLeftRadius: number
    borderBottomRightRadius: number
    boxShadow: string
    color: string
    opacity: number
    rotate?: number
}

/**
 * A snapshot of an element to be taken before and after a render.
 */
export interface Snapshot {
    layout: Box
    style: Style
}

/**
 * Functions provided to animate children of a `SharedLayoutProps` component.
 */
export interface SharedLayoutTree {
    forceRender: () => void
    register: (child: Magic) => () => void
}

/**
 * TODO
 */
export interface TransitionHandler {
    snapshotTarget: (child: Magic) => void
    startAnimation: (child: Magic) => void
}

/**
 * TODO
 */
type FlushMagicChildren = (handler?: TransitionHandler) => void
export interface MagicBatchTree {
    add: (child: Magic) => void
    flush: FlushMagicChildren
}

/**
 * Optional configuration for a animate animation.
 */
export interface AutoAnimationConfig {
    origin?: Snapshot
    target?: Snapshot
    transition?: Transition
    crossfadeEasing?: Easing
    type?: SharedLayoutType
}

export interface MagicProps {
    /**
     * @public
     */
    layoutId?: string

    /**
     * @public
     */
    onMagicComplete?: () => void

    /**
     * @public
     */
    magicDependency?: any

    /**
     * @internal
     */
    allowTransformNone?: boolean
}

export enum SharedLayoutType {
    Crossfade = "crossfade",
    Switch = "switch",
}

export interface SharedLayoutProps {
    /**
     * @public
     */
    children: React.ReactNode

    /**
     * `transition` settings to use for the animate animation. Currently, only one transition
     * can be defined for every animating value and every animating component.
     *
     * @public
     */
    transition?: Transition

    /**
     * TODO: Change to type before merge
     *
     * When combined with `AnimatePresence`, `SharedLayoutProps` can customise how to visually switch
     * between `layoutId` components as new ones enter and leave the tree.
     *
     * - "switch" (default): The old `layoutId` component will be hidden instantly when a new one enters, and
     * the new one will perform the full transition. When the newest one is removed, it will perform
     * the full exit transition and then the old component will be shown instantly.
     * - "crossfade": The root shared components will crossfade as `layoutId` children of both perform
     * the same transition.
     *
     * TODO: Add code example
     *
     * @public
     */
    type: SharedLayoutType

    /**
     * By default, `SharedLayoutProps` will run a animate animation on all children every time
     * it renders.
     *
     * To improve performance we can pass a variable to `dependency`, like a piece of state or a URL.
     * `SharedLayoutProps` will only run animate animations when this dependency changes.
     *
     * @public
     */
    dependency?: any

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
    supportRotate?: boolean
}
