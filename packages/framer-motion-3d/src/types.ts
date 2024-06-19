import type {
    Color,
    Euler,
    MathProps,
    Vector3,
    ThreeElements,
} from "@react-three/fiber"
import type {
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
} from "react"
import type {
    HoverHandlers,
    MotionValue,
    TapHandlers,
    ResolvedValues,
    AnimationLifecycles,
    AnimationProps,
} from "framer-motion"

export interface ThreeMotionProps
    extends AnimationLifecycles,
        AnimationProps,
        TapHandlers,
        HoverHandlers {
    onInstanceUpdate?: MathProps<any>["onUpdate"]
}

export interface ThreeRenderState extends ResolvedValues {}

/**
 * @public
 */
export type ForwardRefComponent<T, P> = ForwardRefExoticComponent<
    PropsWithoutRef<P> & RefAttributes<T>
>

type MotionValueOrNumber = number | MotionValue<number>
type MotionValueVector3 = readonly [
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
    rotation?: Readonly<Euler | MotionValueVector3 | MotionValueOrNumber>
    color?: Color | MotionValue<string>
}

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
export type ThreeMotionComponents = {
    [Tag in keyof ThreeElements]: ForwardRefComponent<
        ThreeElements[Tag],
        ThreeMotionProps &
            Omit<
                AcceptMotionValues<ThreeElements[Tag]>,
                "onUpdate" | "transition"
            >
    >
}
