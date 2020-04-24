import { Auto } from "../../motion/features/auto/Auto"
import { Snapshot } from "../../motion/features/auto/types"
import { Transition } from "../../types"

export enum Presence {
    Entering,
    Present,
    Exiting,
}

export interface LayoutMetadata {
    layoutId?: string
    presence: Presence
    origin?: Snapshot | undefined
    target?: Snapshot | undefined
    position?: StackPosition
    prevPosition?: StackPosition
    depth: number
}

export interface StackQuery {
    isLeadPresent: (id: string | undefined) => boolean | undefined
    getLead: (id: string | undefined) => LayoutMetadata | undefined
    getPreviousOrigin: (id: string | undefined) => Snapshot | undefined
    getPreviousTarget: (id: string | undefined) => Snapshot | undefined
    getLeadOrigin: (id: string | undefined) => Snapshot | undefined
    getLeadTarget: (id: string | undefined) => Snapshot | undefined
    getCrossfadeOut: () => any
    getCrossfadeIn: () => any
    isRootDepth: (depth: number) => boolean
}

export enum VisibilityAction {
    Show,
    Hide,
}

export enum StackPosition {
    Lead,
    Previous,
}

/**
 * Functions provided to animate children of a `SharedLayoutProps` component.
 */
export interface SharedLayoutTree {
    forceRender: () => void
    register: (child: Auto) => () => void
}

export interface TransitionHandler {
    snapshotTarget: (child: Auto) => void
    startAnimation: (child: Auto) => void
}

type FlushMagicChildren = (handler?: TransitionHandler) => void
export interface SharedBatchTree {
    add: (child: Auto) => void
    flush: FlushMagicChildren
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
    type?: "switch" | "crossfade"

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
