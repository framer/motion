import { VisualElement } from ".."
import { MotionProps } from "../../../motion"
import { TargetAndTransition, Variants } from "../../../types"
import { ResolvedValues } from "../types"

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

export type AnimationList = AnimationDefinition

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
    const prevResolvedValues: { [key: string]: ResolvedValues } = {}

    /**
     * When a component receives new props, we need to figure out the new latest animation state.
     * We loop through all the animation props in reverse priority order.
     * When an animation prop has changed, we animate to its new setting.
     * If a value has been removed from a prop, or a prop has been outright removed, we need to
     * animate those values to their next set priority.
     */
    function setProps(props: MotionProps) {
        const animations: any = []

        /**
         * As we loop through the animation types, if we encounter any values that have been removed
         * in this render we keep a record of them. Then, the next animation type we encounter that
         * features that value, we'll use to animate to.
         */
        // const removedValues = new Set<string>()

        for (let i = 0; i < numAnimationTypes; i++) {
            /**
             * Loop through the reverse priority order so the higher priority animations
             * get applied over lower ones.
             */
            const type = reversePriorityOrder[i]

            /**
             * If this animation type isn't active, we can skip to the next one.
             */
            if (!active[type]) continue

            // TODO Remove casting
            const definition = props[type] as AnimationDefinition
            const prevDefinition = (currentProps
                ? currentProps[type]
                : props.initial) as AnimationDefinition

            /**
             * If there's neither an animation definition, nor was there one, there's
             * nothing for us to do here and can skip to the next lower priority.
             */
            if (!definition && !prevDefinition) continue

            const resolvedDefinition = resolveVariant(definition, props)
            const { transition, transitionEnd, ...target } =
                resolvedDefinition || {}

            const definitionHasChanged =
                // This will only ever be true if this is the first render and initial === false
                prevDefinition !== false &&
                compareDefinition(prevResolvedValues, target)

            if (definitionHasChanged) {
                if (definition) {
                    /**
                     * If the definition has changed, and there is now a new definition
                     */
                    animations.push(definition)
                } else if (definition === undefined && prevDefinition) {
                    /**
                     *
                     */
                }
            }

            prevResolvedValues[type] = target
        }

        if (animations.length) visualElement.animate?.(animations)

        currentProps = props
    }

    function setActive(_type: AnimationType, _isActive: boolean) {}

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

function resolveVariant(
    definition?: AnimationDefinition,
    { variants, custom }: MotionProps = {}
) {
    if (typeof definition === "string") {
        const variant = variants?.[definition]

        return typeof variant === "function" ? variant(custom) : variant
    } else {
        return definition
    }
}

function compareDefinition(a?: ResolvedValues, b?: ResolvedValues) {
    // If either is undefined, consider them changed
    if (!a || !b) return true

    /**
     * Otherwise resolve them both and compare targets. Return true on the first
     * encountered different value.
     */
    for (const key in b) {
        if (a[key] !== b[key]) return true
    }

    /**
     * If all the tested values are the same, check that both targets have
     * the same number of keys as a final check.
     */
    return Object.keys(a).length !== Object.keys(b).length
}
