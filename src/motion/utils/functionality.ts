import { MotionProps, VariantLabels } from "motion/types"
import { AnimationManager } from "../../animation"
import { useAnimationSubscription } from "./use-animation-subscription"
import { useVariants } from "./use-variants"
import { useGestures } from "../../gestures"
import { useDraggable } from "../../behaviours"
import { useAnimateValues } from "./use-animate-values"
import {
    createElement,
    ComponentType,
    RefObject,
    CSSProperties,
    EventHandler,
    SyntheticEvent,
} from "react"
import { buildStyleAttr } from "./style-attr"
import { MotionValuesMap } from "./use-motion-values"
import { AnimatePropType } from "../types"
import { Target } from "../../types"
import { AnimationControls } from "./use-animation-controls"
import isPropValid from "@emotion/is-prop-valid"
import { svgElements } from "./supported-elements"

// TODO: We can tidy this up. There's probably a neater or more consistent way to structure this.

type AnimateProps = MotionProps & {
    controls: AnimationControls
    values: MotionValuesMap
    innerRef: RefObject<Element | null>
}

const makeHookComponent = (hook: Function) => (props: AnimateProps) => {
    hook(props)
    return null
}

export const AnimatePropComponents = {
    [AnimatePropType.Target]: makeHookComponent(
        ({
            animate,
            controls,
            values,
            transition,
            onAnimationComplete,
        }: AnimateProps) => {
            return useAnimateValues(
                animate as Target,
                controls,
                values,
                transition,
                onAnimationComplete
            )
        }
    ),
    [AnimatePropType.VariantLabel]: makeHookComponent(
        ({
            animate,
            inherit = true,
            controls,
            onAnimationComplete,
            initial,
        }: AnimateProps) => {
            return useVariants(
                animate as VariantLabels,
                inherit,
                controls,
                initial as VariantLabels,
                onAnimationComplete
            )
        }
    ),
    [AnimatePropType.AnimationSubscription]: makeHookComponent(
        ({ animate, controls }: AnimateProps) => {
            return useAnimationSubscription(
                animate as AnimationManager,
                controls
            )
        }
    ),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: AnimateProps) =>
    animate instanceof AnimationManager

const animatePropTypeTests = {
    [AnimatePropType.Target]: (props: AnimateProps) =>
        props.animate !== undefined &&
        !isVariantLabel(props.animate) &&
        !isAnimationSubscription(props),
    [AnimatePropType.VariantLabel]: ({ variants }: AnimateProps) =>
        variants !== undefined,
    [AnimatePropType.AnimationSubscription]: isAnimationSubscription,
}

export const getAnimatePropType = (
    props: MotionProps
): AnimatePropType | undefined => {
    for (const key in AnimatePropType) {
        if (animatePropTypeTests[key](props)) return key as AnimatePropType
    }
    return undefined
}

export const getAnimateComponent = (
    animatePropType?: string
): ComponentType<AnimateProps> | undefined => {
    return animatePropType ? AnimatePropComponents[animatePropType] : undefined
}

const gestureProps = [
    "drag",
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onTap",
    "onPressStart",
    "onPressEnd",
    "hoverActive",
    "pressActive",
]

export const isGesturesEnabled = (props: MotionProps) =>
    gestureProps.some(key => props.hasOwnProperty(key))
export const isDragEnabled = (props: MotionProps) => !!props.drag

export const Gestures = makeHookComponent(
    ({ innerRef, ...props }: AnimateProps) => useGestures(props, innerRef)
)
export const Draggable = makeHookComponent(
    ({ innerRef, values, controls, ...props }: AnimateProps) =>
        useDraggable(props, innerRef, values, controls)
)

type RenderProps<P> = {
    base: string | ComponentType<P>
    props: P & MotionProps
    innerRef: RefObject<Element | null>
    handlers?: {
        onMouseEnter?: EventHandler<SyntheticEvent>
        onMouseLeave?: EventHandler<SyntheticEvent>
    }
    style: CSSProperties
    values: MotionValuesMap
}

const eventHandlers = new Set(["onTap", "onAnimationComplete", "onUpdate"])

const validProps = (props: MotionProps) => {
    const valid = {}

    for (const key in props) {
        if (isPropValid(key) && !eventHandlers.has(key)) {
            valid[key] = props[key]
        }
    }

    return valid
}

export const RenderComponent = <P>({
    base,
    props,
    innerRef,
    style,
    handlers,
    values,
}: RenderProps<P>) => {
    const isDOM = typeof base === "string"
    const isSVG = isDOM && svgElements.indexOf(base as any) !== -1
    const forwardProps = isDOM ? validProps(props) : props

    return createElement<any>(base, {
        ...forwardProps,
        ...handlers,
        ref: innerRef,
        style: isSVG ? style : buildStyleAttr(values, style),
    })
}

const bindParent = new Set([
    AnimatePropType.AnimationSubscription,
    AnimatePropType.VariantLabel,
])
export const checkShouldInheritVariant = (
    { animate, inherit = true }: MotionProps,
    animatePropType?: AnimatePropType
): boolean => {
    return !!(
        inherit &&
        (animate === undefined || animate instanceof AnimationManager) &&
        animatePropType &&
        bindParent.has(animatePropType)
    )
}
