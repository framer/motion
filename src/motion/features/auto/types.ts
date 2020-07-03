import { Transition } from "../../../types"
import { Easing } from "@popmotion/easing"
import { VisibilityAction } from "../../../components/AnimateSharedLayout/types"
import { AxisBox2D } from "../../../types/geometry"

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
    position: string
}

/**
 * A snapshot of an element to be taken before and after a render.
 */
export interface Snapshot {
    layout: AxisBox2D
    style: Style
}

/**
 * Optional configuration for a animate animation.
 */
export interface AutoAnimationConfig {
    origin?: Snapshot
    target?: Snapshot
    visibilityAction?: VisibilityAction
    transition?: Transition
    crossfadeEasing?: Easing
    type?: "switch" | "crossfade"
    crossfade?: any
    shouldAnimate?: boolean
}

export interface AutoAnimateProps {
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

    /**
     * Manually control a component's place in its layout stack. This is currently only intended for optimisations
     * in Framer's Navigation component.
     *
     * @internal
     */
    layoutOrder?: number

    /**
     * Manually control a component's presence. Currently only intended for optimisations in Framer Navigation component.
     *
     * @internal
     */
    isPresent?: boolean

    /**
     * Manually control whether a component should animate it's transition. Currently only intended for optimisations in Framer Navigation component.
     *
     * @internal
     */
    _shouldAnimate?: boolean
}
