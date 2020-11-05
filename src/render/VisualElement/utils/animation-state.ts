import { VisualElement } from ".."
import { MotionProps } from "../../../motion"
import { TargetAndTransition } from "../../../types"
import { ResolvedValues } from "../types"
import { resolveVariant } from "./variants"

export interface AnimationState {
    setProps: (props: MotionProps) => void
    setActive: (type: AnimationType, isActive: boolean) => void
}

export enum AnimationType {
    Animate = "animate",
    Hover = "whileHover",
    Press = "whileTap",
    Drag = "whileDrag",
    Exit = "exit",
}

type AnimationDefinition = string | TargetAndTransition

export type AnimationList = AnimationDefinition[]

const priorityOrder = [
    AnimationType.Animate,
    AnimationType.Hover,
    AnimationType.Press,
    AnimationType.Drag,
    AnimationType.Exit,
]

const reversePriorityOrder = [...priorityOrder].reverse()
const numAnimationTypes = priorityOrder.length

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

            const definition = active[type] ? props[type] : false
            const prevDefinition = currentProps
                ? currentProps[type]
                : props.initial

            /**
             * If there's neither an animation definition, nor was there one, there's
             * nothing for us to do here and can skip to the next lower priority.
             */
            if (!definition && !prevDefinition) continue

            const prevResolvedTarget = prevResolvedValues[type]
            const resolvedDefinition = resolveVariant(
                visualElement,
                definition || {},
                props
            )
            const { transition, transitionEnd, ...target } =
                resolvedDefinition || {}

            let definitionHasChanged = false

            // If either is undefined, consider the definition changed
            if (!definition || !prevResolvedTarget) {
                definitionHasChanged = true
            }

            /**
             *
             */
            if (removedValues.size && definition) {
                for (const key in target) {
                    if (removedValues.has(key)) {
                        // TODO: Ensure values in this target that are controlled
                        // by a higher priority arent animated here
                        definitionHasChanged = true
                        removedValues.delete(key)
                    }
                }
            }

            const targetKeys = Object.keys(target)

            /**
             * Loop through the previous definition. If a value has changed,
             * consider the definition changed. If a value no longer exists,
             * mark it as one that needs animating.
             */
            if (prevResolvedTarget) {
                const allKeys = Array.from(
                    new Set([...targetKeys, ...Object.keys(prevResolvedTarget)])
                )

                for (let keyIndex = 0; keyIndex < allKeys.length; keyIndex++) {
                    const key = allKeys[keyIndex]

                    if (
                        prevResolvedTarget[key] !== target[key] &&
                        target[key] !== undefined &&
                        !handledValues.has(key)
                    ) {
                        definitionHasChanged = true
                    }

                    if (target[key] === undefined && !handledValues.has(key)) {
                        removedValues.add(key)
                    } else if (target[key] !== undefined) {
                        handledValues.add(key)
                        if (!active[type]) protectedValues.push(key)
                    }
                }
            }

            // If initial===false. This can only happen on initial render.
            if (prevDefinition === false) {
                definitionHasChanged = false
            }

            if (definitionHasChanged) {
                if (definition) {
                    /**
                     * If the definition has changed, and there is now a new definition
                     */
                    animations.push(definition)
                } else if (!definition && prevDefinition) {
                    /**
                     *
                     */
                }
            }

            prevResolvedValues[type] = target
        }

        const finalProtectedValues = new Set(protectedValues)

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

        if (animations.length)
            visualElement.animate?.(animations, finalProtectedValues)

        currentProps = props
    }

    function setActive(type: AnimationType, isActive: boolean) {
        // No-op if active state hasn't changed
        if (isActive === active[type]) return

        // Update state
        active[type] = isActive

        /**
         * If we're changing from inactive to active, we can delete the prev
         * resolved values
         */
        if (isActive) {
            prevResolvedValues[type] = undefined
        }

        setProps(currentProps, type)
    }

    return { setProps, setActive }
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
