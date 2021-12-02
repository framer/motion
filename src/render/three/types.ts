import { MeshProps } from "@react-three/fiber"
import type {
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
} from "react"
import { HoverHandlers, TapHandlers } from "../.."
import { AnimationProps } from "../../motion/types"
import { ResolvedValues } from "../types"
import { AnimationLifecycles } from "../utils/lifecycles"

export interface ThreeMotionProps
    extends AnimationLifecycles,
        AnimationProps,
        TapHandlers,
        HoverHandlers {
    onInstanceUpdate?: MeshProps["onUpdate"]
}

export interface ThreeRenderState {
    latestValues: ResolvedValues
}

/**
 * @public
 */
export type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
    PropsWithoutRef<P> & RefAttributes<T>
>

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export type ThreeMotionComponents = {
    [K in keyof JSX.IntrinsicElements]: ForwardRefComponent<
        JSX.IntrinsicElements[K],
        ThreeMotionProps & Omit<JSX.IntrinsicElements[K], "onUpdate">
    >
}
