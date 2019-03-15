import { MotionProps, VariantLabels } from "../types"
import { AnimationControls } from "../../animation/AnimationControls"
import { useAnimationGroupSubscription } from "../../animation/use-animation-group-subscription"
import { useVariants } from "../../animation/use-variants"
import { useGestures } from "../../gestures"
import { useDraggable } from "../../behaviours"
import { useAnimateProp } from "../../animation/use-animate-prop"
import { createElement, ComponentType, RefObject, CSSProperties } from "react"
import { buildStyleAttr } from "./use-styles"
import { MotionValuesMap } from "./use-motion-values"
import { AnimatePropType } from "../types"
import { Target } from "../../types"
import { ComponentAnimationControls } from "../../animation/ComponentAnimationControls"
import isPropValid from "@emotion/is-prop-valid"
import { svgElements } from "./supported-elements"

// TODO: We can tidy this up. There's probably a neater or more consistent way to structure this.

type AnimateProps = MotionProps & {
    controls: ComponentAnimationControls
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
            return useAnimateProp(
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
            return useAnimationGroupSubscription(
                animate as AnimationControls,
                controls
            )
        }
    ),
}

const isVariantLabel = (prop?: any): prop is VariantLabels =>
    Array.isArray(prop) || typeof prop === "string"

const isAnimationSubscription = ({ animate }: AnimateProps) =>
    animate instanceof AnimationControls

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
    animatePropType?: string,
    isStatic: boolean = false
): ComponentType<AnimateProps> | undefined => {
    return !isStatic && animatePropType
        ? AnimatePropComponents[animatePropType]
        : undefined
}

const gestureProps = [
    "dragEnabled",
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "press",
    "hover",
    "onHoverStart",
    "onHoverEnd",
]

export const isGesturesEnabled = (props: MotionProps) => {
    return gestureProps.some(key => props.hasOwnProperty(key))
}

export const isDragEnabled = (props: MotionProps) => !!props.dragEnabled

export const Gestures = makeHookComponent(
    ({ innerRef, ...props }: AnimateProps) => useGestures(props, innerRef)
)
export const Draggable = makeHookComponent(
    ({ innerRef, values, controls, ...props }: AnimateProps) => {
        return useDraggable(props, innerRef, values, controls)
    }
)

type RenderProps<P> = {
    base: string | ComponentType<P>
    props: P & MotionProps
    innerRef: RefObject<Element | null>
    style: CSSProperties
    values: MotionValuesMap
    isStatic: boolean
}

const eventHandlers = new Set([
    "onTap",
    "onAnimationComplete",
    "onUpdate",
    "onHoverStart",
    "onHoverEnd",
    "onDragStart",
    "onDrag",
    "onDragEnd",
    "onPanStart",
    "onPan",
    "onPanEnd",
    "onDirectionLock",
])

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
    values,
    isStatic,
}: RenderProps<P>) => {
    const isDOM = typeof base === "string"
    const isSVG = isDOM && svgElements.indexOf(base as any) !== -1
    const forwardProps = isDOM ? validProps(props) : props

    return createElement<any>(base, {
        ...forwardProps,
        ref: innerRef,
        style: isSVG ? style : buildStyleAttr(values, style, isStatic),
    })
}

export const checkShouldInheritVariant = ({
    animate,
    inherit = true,
    variants,
    hover,
    tap,
}: MotionProps): boolean => {
    const isVariantChild = inherit && variants && !animate && !hover && !tap
    const isAnimationHookChild = inherit && animate instanceof AnimationControls

    if (isVariantChild || isAnimationHookChild) {
        return true
    } else {
        return false
    }
}
