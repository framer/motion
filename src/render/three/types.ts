import { Color, Euler, MeshProps, Vector3 } from "@react-three/fiber"
import type {
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
} from "react"
import { HoverHandlers, MotionValue, TapHandlers } from "../.."
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

type MotionValueOrNumber = number | MotionValue<number>
type MotionValueVector3 = [
    MotionValueOrNumber,
    MotionValueOrNumber,
    MotionValueOrNumber
]

export type AcceptMotionValues<T> = Omit<
    T,
    "position" | "scale" | "rotation" | "color"
> & {
    position?: Vector3 | MotionValueVector3 | MotionValueOrNumber
    scale?: Vector3 | MotionValueVector3 | MotionValueOrNumber
    rotation?: Euler | MotionValueVector3 | MotionValueOrNumber
    color?: Color | MotionValue<string>
}

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export type ThreeMotionComponents = {
    [K in keyof JSX.IntrinsicElements]: ForwardRefComponent<
        JSX.IntrinsicElements[K],
        ThreeMotionProps &
            Omit<AcceptMotionValues<JSX.IntrinsicElements[K]>, "onUpdate">
    >
}
