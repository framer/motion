import { VisualElement } from ".."
import { AnimationControls } from "../../../animation/AnimationControls"
import { MotionProps } from "../../../motion"
import { TargetAndTransition } from "../../../types"
import { shallowCompare } from "../../../utils/shallow-compare"
import { ResolvedValues } from "../types"
import { animateVisualElement } from "./animation"
import { isVariantLabels, resolveVariant } from "./variants"

export interface AnimationState {
    setProps: (props: MotionProps) => Promise<any>
    setActive: (type: AnimationType, isActive: boolean) => Promise<any>
}

export enum AnimationType {
    Animate = "animate",
    Hover = "whileHover",
    Press = "whileTap",
    Drag = "whileDrag",
    Exit = "exit",
}

export type AnimationList = string[] | TargetAndTransition[]

export const variantPriorityOrder = [
    AnimationType.Animate,
    AnimationType.Hover,
    AnimationType.Press,
    AnimationType.Drag,
    AnimationType.Exit,
]

const reversePriorityOrder = [...variantPriorityOrder].reverse()
const numAnimationTypes = variantPriorityOrder.length

export function createAnimationState(
    visualElement: VisualElement
): AnimationState {
    let currentProps: MotionProps

    const active = initialActiveState()

    /**
     * We use this object to record which values a given prop set in the previous render.
     * This will be used to determine whether it's changed.
     */
    const prevResolvedValues: { [key: string]: ResolvedValues | undefined } = {}

    /**
     * When a component receives new props, we need to figure out the new latest animation state.
     * We loop through all the animation props in reverse priority order.
     * When an animation prop has changed, we animate to its new setting.
     * If a value has been removed from a prop, or a prop has been outright removed, we need to
     * animate those values to their next set priority.
     */
    function setProps(props: MotionProps, switchedActive?: AnimationType) {
        const animations: any = []

        /**
         * This is a set of keys that have been handled in some way.
         */
        const handledValues = new Set<string>()

        /**
         * A set of keys of values that aren't going to be animated because
         * they're defined by a non-animating priority.
         */
        const protectedValues: string[] = []

        /**
         * As we loop through the animation types, if we encounter any values that have been removed
         * in this render we keep a record of them. Then, the next animation type we encounter that
         * features that value, we'll use to animate to.
         */
        const removedValues = new Set<string>()

        for (let i = 0; i < numAnimationTypes; i++) {
            /**
             * Loop through the reverse priority order so the higher priority animations
             * get applied over lower ones.
             */
            const type = reversePriorityOrder[i]

            /**
             * If this animation type isn't active, we can skip to the next one.
             */
            if (!active[type]) {
                // If has just been deactivated, we want to handle that
                if (switchedActive === type) {
                } else {
                    continue
                }
            }

            const definition =
                active[type] || switchedActive === type ? props[type] : false
            const prevDefinition = currentProps
                ? currentProps[type]
                : props.initial

            /**
             * If there's neither an animation definition, nor was there one, there's
             * nothing for us to do here and can skip to the next lower priority.
             */
            if (
                (!definition && !prevDefinition) ||
                typeof definition === "boolean" ||
                definition instanceof AnimationControls
            ) {
                continue
            }

            const prevResolvedTarget = prevResolvedValues[type]
            const definitionList = Array.isArray(definition)
                ? [...definition].reverse()
                : [definition]

            let shouldAnimate =
                // We should animate if this definition has been made undefined
                !definition ||
                // Or if we previously resolved no target values
                !prevResolvedTarget ||
                // Or if these are variant labels that have changed
                variantsHaveChanged(prevDefinition, definition)

            const resolvedDefinitions: any[] = []
            let resolvedValues = {}

            for (
                let definitionIndex = 0;
                definitionIndex < definitionList.length;
                definitionIndex++
            ) {
                const thisDefinition = definitionList[definitionIndex]
                const resolved = resolveVariant(
                    visualElement,
                    thisDefinition,
                    props.custom
                )
                resolved && resolvedDefinitions.push(resolved)

                const { transition, transitionEnd, ...target } = resolved || {}
                resolvedValues = { ...resolvedValues, ...target }

                /**
                 * If there's any removedValues from higher-priority animations,
                 * we need to check to see if they've been defined here.
                 */
                if (thisDefinition && removedValues.size) {
                    for (const key in target) {
                        if (removedValues.has(key)) {
                            shouldAnimate = true
                            removedValues.delete(key)
                        }
                    }
                }
            }

            /**
             * Loop through the previous definition. If a value has changed,
             * consider the definition changed. If a value no longer exists,
             * mark it as one that needs animating.
             */
            const prevTypeResolvedValues = prevResolvedValues[type]

            if (prevTypeResolvedValues || switchedActive === type) {
                const allKeys = Array.from(
                    new Set([
                        ...Object.keys(resolvedValues),
                        ...Object.keys(prevTypeResolvedValues || {}),
                    ])
                )

                for (let keyIndex = 0; keyIndex < allKeys.length; keyIndex++) {
                    const key = allKeys[keyIndex]

                    if (
                        !shouldAnimate &&
                        prevTypeResolvedValues?.[key] !== resolvedValues[key] &&
                        resolvedValues[key] !== undefined &&
                        !handledValues.has(key)
                    ) {
                        shouldAnimate = true
                    }

                    if (
                        (switchedActive === type && active[type] === false) ||
                        (resolvedValues[key] === undefined &&
                            !handledValues.has(key))
                    ) {
                        removedValues.add(key)
                    } else if (resolvedValues[key] !== undefined) {
                        if (
                            active[type] &&
                            !shouldAnimate &&
                            !handledValues.has(key)
                        ) {
                            protectedValues.push(key)
                        }
                        handledValues.add(key)
                    }
                }
            }

            if (prevDefinition === false) shouldAnimate = false

            shouldAnimate && animations.push(...resolvedDefinitions)

            prevResolvedValues[type] = resolvedValues
        }

        const finalProtectedValues = new Set(protectedValues)

        /**
         * If there are some removed values that haven't been dealt with, we
         * need to create a new animation that falls back either to the value
         * defined in the style prop, or the last recorded base target.
         */
        if (removedValues.size) {
            const fallbackAnimation = {}
            removedValues.forEach((key) => {
                const fallbackTarget =
                    props.style?.[key] ?? visualElement.baseTarget[key]

                if (fallbackTarget !== undefined) {
                    finalProtectedValues.delete(key)
                    fallbackAnimation[key] = fallbackTarget
                }
            })

            animations.push(fallbackAnimation)
        }

        currentProps = props

        return animations.length
            ? animateVisualElement(visualElement, animations)
            : Promise.resolve()
    }

    function setActive(type: AnimationType, isActive: boolean) {
        // No-op if active state hasn't changed
        if (isActive === active[type]) return Promise.resolve()

        // Update state
        active[type] = isActive

        /**
         * If we're changing from inactive to active, we can delete the prev
         * resolved values
         */
        if (isActive) prevResolvedValues[type] = undefined

        return setProps(currentProps, type)
    }

    return { setProps, setActive }
}

export function variantsHaveChanged(prev: any, next: any) {
    if (typeof next === "string" && typeof prev === "string") {
        return next !== prev
    } else if (isVariantLabels(prev) && isVariantLabels(next)) {
        return shallowCompare(prev, next)
    }

    return false
}

function initialActiveState() {
    return {
        [AnimationType.Animate]: true,
        [AnimationType.Hover]: false,
        [AnimationType.Press]: false,
        [AnimationType.Drag]: false,
        [AnimationType.Exit]: false,
    }
}
