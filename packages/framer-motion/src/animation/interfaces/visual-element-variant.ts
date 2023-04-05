import { resolveVariant } from "../../render/utils/resolve-dynamic-variants"
import { VisualElement } from "../../render/VisualElement"
import { VisualElementAnimationOptions } from "./types"
import { animateTarget } from "./visual-element-target"

export function animateVariant(
    visualElement: VisualElement,
    variant: string,
    options: VisualElementAnimationOptions = {}
) {
    const resolved = resolveVariant(visualElement, variant, options.custom)
    let { transition = visualElement.getDefaultTransition() || {} } =
        resolved || {}
    const { when } = transition

    if (options.transitionOverride) {
        transition = options.transitionOverride
    }

    let preparedAnimation: () => Promise<void | unknown> = () =>
        Promise.resolve()
    if (resolved) {
        const animations = animateTarget(visualElement, resolved, options)
        preparedAnimation = () => Promise.all(animations())
    }

    let preparedChildrenAnimations: () => Promise<void | unknown> = () =>
        Promise.resolve()
    if (visualElement.variantChildren && visualElement.variantChildren.size) {
        const {
            delayChildren = 0,
            staggerChildren,
            staggerDirection,
        } = transition

        preparedChildrenAnimations = animateChildren(
            visualElement,
            variant,
            delayChildren + (when ? 0 : options.delay || 0),
            staggerChildren,
            staggerDirection,
            options
        )
    }

    return () => {
        /**
         * If the transition explicitly defines a "when" option, we need to resolve either
         * this animation or all children animations before playing the other.
         */
        if (when) {
            const [first, last] =
                when === "beforeChildren"
                    ? [preparedAnimation, preparedChildrenAnimations]
                    : [preparedChildrenAnimations, preparedAnimation]
            return first().then(() => last())
        } else {
            return Promise.all([
                preparedAnimation(),
                preparedChildrenAnimations(),
            ])
        }
    }
}

function animateChildren(
    visualElement: VisualElement,
    variant: string,
    delayChildren = 0,
    staggerChildren = 0,
    staggerDirection = 1,
    options: VisualElementAnimationOptions
) {
    const animations: (() => Promise<any>)[] = []

    const maxStaggerDuration =
        (visualElement.variantChildren!.size - 1) * staggerChildren

    const generateStaggerDuration =
        staggerDirection === 1
            ? (i = 0) => i * staggerChildren
            : (i = 0) => maxStaggerDuration - i * staggerChildren

    Array.from(visualElement.variantChildren!)
        .sort(sortByTreeOrder)
        .forEach((child, i) => {
            const preparedAnimation = animateVariant(child, variant, {
                ...options,
                delay: delayChildren + generateStaggerDuration(i),
            })

            animations.push(() => {
                child.notify("AnimationStart", variant)
                return preparedAnimation().then(() =>
                    child.notify("AnimationComplete", variant)
                )
            })
        })

    return () => Promise.all(animations)
}

export function sortByTreeOrder(a: VisualElement, b: VisualElement) {
    return a.sortNodePosition(b)
}
