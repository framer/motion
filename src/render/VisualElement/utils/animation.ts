import { VisualElement } from ".."
import { VariantLabels, TargetAndTransition, Transition } from "../../.."
import { startAnimation } from "../../../animation/utils/transitions"
import { Target, TargetResolver, TargetWithKeyframes } from "../../../types"
import { AnimationType } from "./animation-state"
import { setTarget } from "./setters"
import { resolveVariant } from "./variants"

export type AnimationDefinition =
    | VariantLabels
    | TargetAndTransition
    | TargetResolver

export type AnimationOptions = {
    delay?: number
    transitionOverride?: Transition
    custom?: any
    type?: AnimationType
}

export type MakeTargetAnimatable = (
    visualElement: VisualElement,
    target: TargetWithKeyframes,
    origin?: Target,
    transitionEnd?: Target
) => {
    target: TargetWithKeyframes
    transitionEnd?: Target
}

/**
 * @internal
 */
export function animateVisualElement(
    visualElement: VisualElement,
    definition: AnimationDefinition,
    options?: AnimationOptions
) {
    visualElement.onAnimationStart()

    let animation: Promise<any>

    if (Array.isArray(definition)) {
        const animations = definition.map((variant) =>
            animateVariant(visualElement, variant, options)
        )
        animation = Promise.all(animations)
    } else if (typeof definition === "string") {
        animation = animateVariant(visualElement, definition, options)
    } else {
        // TODO: Remove any and handle TargetResolver
        animation = animateTarget(visualElement, definition as any, options)
    }

    return animation.then(() => visualElement.onAnimationComplete())
}

function animateVariant(
    visualElement: VisualElement,
    variant: string,
    options: AnimationOptions = {}
) {
    const resolved = resolveVariant(visualElement, variant, options.custom)
    let { transition = visualElement.getDefaultTransition() || {} } =
        resolved || {}

    if (options.transitionOverride) {
        transition = options.transitionOverride
    }

    /**
     * If we have a variant, create a callback that runs it as an animation.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getAnimation = resolved
        ? () => animateTarget(visualElement, resolved, options)
        : () => Promise.resolve()

    /**
     * If we have children, create a callback that runs all their animations.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getChildAnimations = visualElement.variantChildrenOrder?.size
        ? (forwardDelay = 0) => {
              const {
                  delayChildren = 0,
                  staggerChildren,
                  staggerDirection,
              } = transition

              return animateChildren(
                  visualElement,
                  variant,
                  delayChildren + forwardDelay,
                  staggerChildren,
                  staggerDirection,
                  options
              )
          }
        : () => Promise.resolve()

    /**
     * If the transition explicitly defines a "when" option, we need to resolve either
     * this animation or all children animations before playing the other.
     */
    const { when } = transition
    if (when) {
        const [first, last] =
            when === "beforeChildren"
                ? [getAnimation, getChildAnimations]
                : [getChildAnimations, getAnimation]

        return first().then(last)
    } else {
        return Promise.all([getAnimation(), getChildAnimations(options.delay)])
    }
}

/**
 * @internal
 */
function animateTarget(
    visualElement: VisualElement,
    definition: TargetAndTransition,
    { delay = 0, transitionOverride, type }: AnimationOptions = {}
): Promise<any> {
    let {
        transition = visualElement.getDefaultTransition(),
        transitionEnd,
        ...target
    } = visualElement.makeTargetAnimatable(definition)

    if (transitionOverride) transition = transitionOverride

    const animations: Promise<any>[] = []

    const protectedValues =
        type && visualElement.animationState?.getProtectedKeys(type)

    for (const key in target) {
        const value = visualElement.getValue(key)
        const valueTarget = target[key]

        if (
            !value ||
            valueTarget === undefined ||
            protectedValues?.[key] !== undefined
        ) {
            continue
        }

        const animation = startAnimation(key, value, valueTarget, {
            delay,
            ...transition,
        })

        animations.push(animation)
    }

    return Promise.all(animations).then(() => {
        transitionEnd && setTarget(visualElement, transitionEnd)
    })
}

function animateChildren(
    visualElement: VisualElement,
    variant: string,
    delayChildren = 0,
    staggerChildren = 0,
    staggerDirection = 1,
    options: AnimationOptions
) {
    const animations: Promise<any>[] = []

    const maxStaggerDuration =
        (visualElement.variantChildrenOrder!.size - 1) * staggerChildren

    const generateStaggerDuration =
        staggerDirection === 1
            ? (i = 0) => i * staggerChildren
            : (i = 0) => maxStaggerDuration - i * staggerChildren

    Array.from(visualElement.variantChildrenOrder!).forEach((child, i) => {
        const animation = animateVariant(child, variant, {
            ...options,
            delay: delayChildren + generateStaggerDuration(i),
        })
        animations.push(animation)
    })

    return Promise.all(animations)
}

export function stopAnimation(visualElement: VisualElement) {
    visualElement.forEachValue((value) => value.stop())
}
