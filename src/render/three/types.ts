import type {
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
} from "react"
import { MotionProps } from "../.."
import { ResolvedValues } from "../types"
import { ThreeElements } from "./supported-elements"

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
    [K in ThreeElements]: ForwardRefComponent<
        JSX.IntrinsicElements[K],
        MotionProps
    >
}
