import { VisualElement } from ".."
import { VariantLabels, TargetAndTransition, Transition } from "../../.."
import { startAnimation } from "../../../animation/utils/transitions"
import {
    Target,
    TargetResolver,
    TargetWithKeyframes,
    Variant,
} from "../../../types"
import { resolveFinalValueInKeyframes } from "../../../utils/resolve-value"
import { setTarget } from "./setters"
import { isVariantLabel, isVariantLabels, resolveVariant } from "./variants"

export type AnimationDefinition =
    | VariantLabels
    | TargetAndTransition
    | TargetResolver

export type AnimationOptions = {
    delay?: number
    priority?: number
    transitionOverride?: Transition
    custom?: any
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
export function startVisualElementAnimation(
    visualElement: VisualElement,
    definition: AnimationDefinition,
    opts: AnimationOptions = {}
) {
    let animation

    if (isVariantLabels(definition)) {
        animation = animateVariantLabels(visualElement, definition, opts)
    } else if (isVariantLabel(definition)) {
        animation = animateVariant(visualElement, definition, opts)
    } else {
        animation = animateTarget(visualElement, definition, opts)
    }

    visualElement.onAnimationStart()
    return animation.then(() => visualElement.onAnimationComplete())
}

function animateVariantLabels(
    visualElement: VisualElement,
    variantLabels: string[],
    opts?: AnimationOptions
) {
    const animations = [...variantLabels]
        .reverse()
        .map((label) => animateVariant(visualElement, label, opts))
    return Promise.all(animations)
}

function animateVariant(
    visualElement: VisualElement,
    label: string,
    opts?: AnimationOptions
) {
    const priority = (opts && opts.priority) || 0
    const variantDefinition = visualElement.getVariant(label)
    const variant = resolveVariant(
        visualElement,
        variantDefinition,
        opts && opts.custom
    )
    const transition = variant.transition || {}

    /**
     * If we have a variant, create a callback that runs it as an animation.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getAnimation = variantDefinition
        ? () => animateTarget(visualElement, variant, opts)
        : () => Promise.resolve()

    /**
     * If we have children, create a callback that runs all their animations.
     * Otherwise, we resolve a Promise immediately for a composable no-op.
     */
    const getChildrenAnimations = visualElement.variantChildrenOrder?.size
        ? (forwardDelay: number = 0) => {
              const { delayChildren = 0 } = transition

              return animateChildren(
                  visualElement,
                  label,
                  delayChildren + forwardDelay,
                  transition.staggerChildren,
                  transition.staggerDirection,
                  priority,
                  opts?.custom
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
                ? [getAnimation, getChildrenAnimations]
                : [getChildrenAnimations, getAnimation]
        return first().then(last)
    } else {
        return Promise.all([getAnimation(), getChildrenAnimations(opts?.delay)])
    }
}

function animateChildren(
    visualElement: VisualElement,
    variantLabel: string,
    delayChildren: number = 0,
    staggerChildren: number = 0,
    staggerDirection: number = 1,
    priority: number = 0,
    custom?: any
) {
    const animations: Array<Promise<any>> = []
    const maxStaggerDuration =
        (visualElement.variantChildrenOrder!.size - 1) * staggerChildren
    const generateStaggerDuration =
        staggerDirection === 1
            ? (i: number) => i * staggerChildren
            : (i: number) => maxStaggerDuration - i * staggerChildren

    Array.from(visualElement.variantChildrenOrder!).forEach((child, i) => {
        const animation = animateVariant(child, variantLabel, {
            priority,
            delay: delayChildren + generateStaggerDuration(i),
            custom,
        })
        animations.push(animation)
    })

    return Promise.all(animations)
}

export function stopAnimation(visualElement: VisualElement) {
    visualElement.forEachValue((value) => value.stop())
}

export function animateTarget(
    visualElement: VisualElement,
    definition: Variant,
    {
        delay = 0,
        priority = 0,
        transitionOverride,
        custom,
    }: AnimationOptions = {}
): Promise<any> {
    const targetAndTransition = resolveVariant(
        visualElement,
        definition,
        custom
    )

    if (transitionOverride) targetAndTransition.transition = transitionOverride

    const {
        transitionEnd,
        transition,
        ...target
    } = visualElement.makeTargetAnimatable(targetAndTransition)

    const animations: Array<Promise<any>> = []

    for (const key in target) {
        const value = visualElement.getValue(key)

        if (!value || !target || target[key] === undefined) continue

        const valueTarget = target[key]

        if (!priority) {
            visualElement.baseTarget[key] = resolveFinalValueInKeyframes(
                valueTarget
            )
        }

        if (visualElement.isAnimating.has(key)) continue
        visualElement.isAnimating.add(key)

        animations.push(
            startAnimation(key, value, valueTarget, {
                delay,
                ...transition,
            })
        )
    }

    const allAnimations = Promise.all(animations)

    return transitionEnd
        ? allAnimations.then(() =>
              setTarget(visualElement, (transitionEnd as any)!, { priority })
          )
        : allAnimations
}
