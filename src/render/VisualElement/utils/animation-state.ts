import { VisualElement } from ".."
import { AnimationControls } from "../../../animation/AnimationControls"
import { MotionProps } from "../../../motion"
import { VariantContextProps } from "../../../motion/context/MotionContext"
import { VariantLabels } from "../../../motion/types"
import { TargetAndTransition } from "../../../types"
import { shallowCompare } from "../../../utils/shallow-compare"
import { animateVisualElement, AnimationDefinition } from "./animation"
import { isVariantLabel, isVariantLabels, resolveVariant } from "./variants"

export interface AnimationState {
    setProps: (
        props: MotionProps,
        context?: VariantContextProps
    ) => Promise<any>
    setActive: (type: AnimationType, isActive: boolean) => void
    setAnimateFunction: (fn: any) => void
    getProtectedKeys: (type: AnimationType) => { [key: string]: any }
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

function animateList(visualElement: VisualElement) {
    return (animations: AnimationDefinition[]) =>
        Promise.all(
            animations.map((animation) =>
                animateVisualElement(visualElement, animation)
            )
        )
}

export function createAnimationState(
    visualElement: VisualElement
): AnimationState {
    let animate = animateList(visualElement)
    const state = createState()
    let isInitialRender = true

    function getProtectedKeys(type: AnimationType) {
        return state[type].protectedKeys
    }

    /**
     * This just allows us to inject mocked animation functions
     * @internal
     */
    function setAnimateFunction(makeAnimator: typeof animateList) {
        animate = makeAnimator(visualElement)
    }

    let currentProps: MotionProps
    let currentContext: VariantContextProps
    /**
     * When we receive new props, we need to:
     * 1. Create a list of protected keys for each type. This is a directory of
     *    value keys that are currently being "handled" by types of a higher priority
     *    so that whenever an animation is played of a given type, these values are
     *    protected from being animated.
     * 2. Determine if an animation type needs animating.
     * 3. Determine if any values have been removed from a type and figure out
     *    what to animate those to.
     */
    function setProps(
        props: MotionProps,
        context: VariantContextProps = {},
        changedActiveType?: AnimationType
    ) {
        /**
         * Keep track of the most recent props and contexts. setActive can pass these
         * straight through rather than requiring external callers to have access to these.
         */
        currentProps = props
        currentContext = context

        /**
         * A list of animations that we'll build into as we iterate through the animation
         * types. This will get executed at the end of the function.
         */
        const animations: AnimationDefinition[] = []

        /**
         * Keep track of which values have been removed. Then, as we hit lower priority
         * animation types, we can check if they contain removed values and animate to that.
         */
        const removedKeys = new Set<string>()

        /**
         * A dictionary of all encountered keys. This is an object to let us build into and
         * copy it without iteration. Each time we hit an animation type we set its protected
         * keys - the keys its not allowed to animate - to the latest version of this object.
         */
        let encounteredKeys = {}

        /**
         * This function will be used to reduce the animation definitions for
         * each active animation type into an object of resolved values for it.
         */
        const buildResolvedTypeValues = (
            acc: { [key: string]: any },
            definition: string | TargetAndTransition | undefined
        ) => {
            const resolved = resolveVariant(visualElement, definition)

            if (resolved) {
                const { transition, transitionEnd, ...target } = resolved
                encounteredKeys = { ...encounteredKeys, ...target }
                acc = { ...acc, ...target }
            }

            return acc
        }

        // TODO Reconcile with other update config
        if (props.variants) {
            visualElement.updateConfig({
                ...(visualElement as any).config,
                variants: props.variants,
            } as any)
        }

        /**
         * Iterate through all animation types in reverse priority order. For each, we want to
         * detect which values it's handling and whether or not they've changed (and therefore
         * need to be animated). If any values have been removed, we want to detect those in
         * lower priority props and flag for animation.
         */
        for (let i = 0; i < numAnimationTypes; i++) {
            const type = reversePriorityOrder[i]
            const typeState = state[type]
            const prop = props[type] ?? context[type]
            const isDisablingType =
                type === changedActiveType && !typeState.isActive

            /**
             * If this prop is an inherited variant, rather than been set directly on the
             * component itself, we want to make sure we allow the parent to trigger animations.
             */
            const isInherited = prop === context[type] && isVariantLabel(prop)

            /**
             * Set all encountered keys so far as the protected keys for this type. This will
             * be any key that has been animated or otherwise handled by active, higher-priortiy types.
             */
            typeState.protectedKeys = { ...encounteredKeys }

            // Check if we can skip analysing this prop early
            if (
                // If it isn't active and hasn't *just* been set as inactive
                (!typeState.isActive && !isDisablingType) ||
                // If we didn't and don't have any defined prop for this animation type
                (!prop && !typeState.prevProp) ||
                // Or if the prop doesn't define an animation
                prop instanceof AnimationControls ||
                typeof prop === "boolean"
            ) {
                continue
            }

            /**
             * As we go look through the values defined on this type, if we detect
             * a changed value or a value that was removed in a higher priority, we set
             * this to true and add this prop to the animation list.
             */
            let shouldAnimateType = variantsHaveChanged(
                typeState.prevProp,
                prop
            )

            /**
             * As animations can be set as variant lists, variants or target objects, we
             * coerce everything to an array if it isn't one already
             */
            const definitionList = Array.isArray(prop) ? prop : [prop]

            /**
             * Build an object of all the resolved values. We'll use this in the subsequent
             * setProps calls to determine whether a value has changed.
             */
            const resolvedValues = !isDisablingType
                ? definitionList.reduce(buildResolvedTypeValues, {})
                : {}

            /**
             * Now we need to loop through all the keys in the prev prop and this prop,
             * and decide:
             * 1. If the value has changed, and needs animating
             * 2. If it has been removed, and needs adding to the removedKeys set
             * 3. If it has been removed in a higher priority type and needs animating
             * 4. If it hasn't been removed in a higher priority but hasn't changed, and
             *    needs adding to the type's protectedKeys list.
             */
            const { prevResolvedValues = {} } = typeState
            const allKeys = {
                ...prevResolvedValues,
                ...resolvedValues,
            }

            for (const key in allKeys) {
                const next = resolvedValues[key]
                const prev = prevResolvedValues[key]

                if (next !== prev) {
                    if (next !== undefined) {
                        // If next is defined and doesn't equal prev, it needs animating
                        shouldAnimateType = true
                        removedKeys.delete(key)
                    } else {
                        // If it's undefined, it's been removed.
                        removedKeys.add(key)
                    }
                } else if (next !== undefined && removedKeys.has(key)) {
                    /**
                     * If next hasn't changed and it isn't undefined, we want to check if it's
                     * been removed by a higher priority
                     */
                    shouldAnimateType = true
                    removedKeys.delete(key)
                } else {
                    typeState.protectedKeys[key] = true
                }
            }

            /**
             * Update the typeState so next time setProps is called we can compare the
             * latest prop and resolvedValues to these.
             */
            typeState.prevProp = prop
            typeState.prevResolvedValues = resolvedValues

            /**
             * If this is an inherited prop we want to hard-block animations
             * TODO: Test as this should probably still handle animations triggered
             * by removed values?
             */
            if (shouldAnimateType && !isInherited) {
                animations.push(...(definitionList as any))
            }
        }

        /**
         * If there are some removed value that haven't been dealt with,
         * we need to create a new animation that falls back either to the value
         * defined in the style prop, or the last read value.
         */
        if (removedKeys.size) {
            const fallbackAnimation = {}
            removedKeys.forEach((key) => {
                const fallbackTarget =
                    props.style?.[key] ?? visualElement.baseTarget[key]

                if (fallbackTarget !== undefined) {
                    fallbackAnimation[key] = fallbackTarget
                }
            })

            animations.push(fallbackAnimation)
        }

        let shouldAnimate = Boolean(animations.length)

        if (isInitialRender && props.initial === false) {
            shouldAnimate = false
        }

        isInitialRender = false

        return shouldAnimate ? animate(animations) : Promise.resolve()
    }

    /**
     * Change whether a certain animation type is active.
     */
    function setActive(type: AnimationType, isActive: boolean) {
        // If the active state hasn't changed, we can safely do nothing here
        if (state[type].isActive === isActive) return

        state[type].isActive = isActive

        let props = currentProps
        let context = currentContext

        /**
         * If we're setting the type to active, we can just delete the previously
         * stored prop, so when it's compared, it'll look as if it's been set to undefined.
         * Likewise, if we're setting the type to inactive, we can pass through undefined
         * as the latest prop/context.
         */
        if (isActive) {
            state[type].prevProp = undefined
        } else {
            props = { ...props, [type]: undefined }
            context = { ...context, [type]: undefined }
        }

        return setProps(props, context, type)
    }

    return { getProtectedKeys, setProps, setActive, setAnimateFunction }

    // let currentProps: MotionProps

    // const active = initialActiveState()

    // /**
    //  * We use this object to record which values a given prop set in the previous render.
    //  * This will be used to determine whether it's changed.
    //  */
    // const prevResolvedValues: { [key: string]: ResolvedValues | undefined } = {}

    // /**
    //  * When a component receives new props, we need to figure out the new latest animation state.
    //  * We loop through all the animation props in reverse priority order.
    //  * When an animation prop has changed, we animate to its new setting.
    //  * If a value has been removed from a prop, or a prop has been outright removed, we need to
    //  * animate those values to their next set priority.
    //  */
    // function setProps(props: MotionProps, switchedActive?: AnimationType) {
    //     const animations: any = []

    //     /**
    //      * This is a set of keys that have been handled in some way.
    //      */
    //     const handledValues = new Set<string>()

    //     /**
    //      * A set of keys of values that aren't going to be animated because
    //      * they're defined by a non-animating priority.
    //      */
    //     const protectedValues: string[] = []

    //     /**
    //      * As we loop through the animation types, if we encounter any values that have been removed
    //      * in this render we keep a record of them. Then, the next animation type we encounter that
    //      * features that value, we'll use to animate to.
    //      */
    //     const removedValues = new Set<string>()

    //     for (let i = 0; i < numAnimationTypes; i++) {
    //         /**
    //          * Loop through the reverse priority order so the higher priority animations
    //          * get applied over lower ones.
    //          */
    //         const type = reversePriorityOrder[i]

    //         /**
    //          * If this animation type isn't active, we can skip to the next one.
    //          */
    //         if (!active[type]) {
    //             // If has just been deactivated, we want to handle that
    //             if (switchedActive === type) {
    //             } else {
    //                 continue
    //             }
    //         }

    //         const definition =
    //             active[type] || switchedActive === type ? props[type] : false
    //         const prevDefinition = currentProps
    //             ? currentProps[type]
    //             : props.initial

    //         /**
    //          * If there's neither an animation definition, nor was there one, there's
    //          * nothing for us to do here and can skip to the next lower priority.
    //          */
    //         if (
    //             (!definition && !prevDefinition) ||
    //             typeof definition === "boolean" ||
    //             definition instanceof AnimationControls
    //         ) {
    //             continue
    //         }

    //         const prevResolvedTarget = prevResolvedValues[type]
    //         const definitionList = Array.isArray(definition)
    //             ? [...definition].reverse()
    //             : [definition]

    //         let shouldAnimate =
    //             // We should animate if this definition has been made undefined
    //             !definition ||
    //             // Or if we previously resolved no target values
    //             !prevResolvedTarget ||
    //             // Or if these are variant labels that have changed
    //             variantsHaveChanged(prevDefinition, definition)

    //         const resolvedDefinitions: any[] = []
    //         let resolvedValues = {}

    //         for (
    //             let definitionIndex = 0;
    //             definitionIndex < definitionList.length;
    //             definitionIndex++
    //         ) {
    //             const thisDefinition = definitionList[definitionIndex]
    //             const resolved = resolveVariant(
    //                 visualElement,
    //                 thisDefinition,
    //                 props.custom
    //             )
    //             resolved && resolvedDefinitions.push(resolved)

    //             const { transition, transitionEnd, ...target } = resolved || {}
    //             resolvedValues = { ...resolvedValues, ...target }

    //             /**
    //              * If there's any removedValues from higher-priority animations,
    //              * we need to check to see if they've been defined here.
    //              */
    //             if (thisDefinition && removedValues.size) {
    //                 for (const key in target) {
    //                     if (removedValues.has(key)) {
    //                         shouldAnimate = true
    //                         removedValues.delete(key)
    //                     }
    //                 }
    //             }
    //         }

    //         /**
    //          * Loop through the previous definition. If a value has changed,
    //          * consider the definition changed. If a value no longer exists,
    //          * mark it as one that needs animating.
    //          */
    //         const prevTypeResolvedValues = prevResolvedValues[type]

    //         if (prevTypeResolvedValues || switchedActive === type) {
    //             const allKeys = Array.from(
    //                 new Set([
    //                     ...Object.keys(resolvedValues),
    //                     ...Object.keys(prevTypeResolvedValues || {}),
    //                 ])
    //             )

    //             for (let keyIndex = 0; keyIndex < allKeys.length; keyIndex++) {
    //                 const key = allKeys[keyIndex]

    //                 if (
    //                     !shouldAnimate &&
    //                     prevTypeResolvedValues?.[key] !== resolvedValues[key] &&
    //                     resolvedValues[key] !== undefined &&
    //                     !handledValues.has(key)
    //                 ) {
    //                     shouldAnimate = true
    //                 }

    //                 if (
    //                     (switchedActive === type && active[type] === false) ||
    //                     (resolvedValues[key] === undefined &&
    //                         !handledValues.has(key))
    //                 ) {
    //                     removedValues.add(key)
    //                 } else if (resolvedValues[key] !== undefined) {
    //                     if (
    //                         active[type] &&
    //                         !shouldAnimate &&
    //                         !handledValues.has(key)
    //                     ) {
    //                         protectedValues.push(key)
    //                     }
    //                     handledValues.add(key)
    //                 }
    //             }
    //         }

    //         if (prevDefinition === false) shouldAnimate = false

    //         shouldAnimate && animations.push(...resolvedDefinitions)

    //         prevResolvedValues[type] = resolvedValues
    //     }

    //     const finalProtectedValues = new Set(protectedValues)

    //     /**
    //      * If there are some removed values that haven't been dealt with, we
    //      * need to create a new animation that falls back either to the value
    //      * defined in the style prop, or the last recorded base target.
    //      */
    //     if (removedValues.size) {
    //         const fallbackAnimation = {}
    //         removedValues.forEach((key) => {
    //             const fallbackTarget =
    //                 props.style?.[key] ?? visualElement.baseTarget[key]

    //             if (fallbackTarget !== undefined) {
    //                 finalProtectedValues.delete(key)
    //                 fallbackAnimation[key] = fallbackTarget
    //             }
    //         })

    //         animations.push(fallbackAnimation)
    //     }

    //     currentProps = props

    //     return animations.length
    //         ? animateVisualElement(visualElement, animations)
    //         : Promise.resolve()
    // }

    // function setActive(type: AnimationType, isActive: boolean) {
    //     // No-op if active state hasn't changed
    //     if (isActive === active[type]) return Promise.resolve()

    //     // Update state
    //     active[type] = isActive

    //     /**
    //      * If we're changing from inactive to active, we can delete the prev
    //      * resolved values
    //      */
    //     if (isActive) prevResolvedValues[type] = undefined

    //     return setProps(currentProps, type)
    // }

    // return { setProps, setActive }
}

export function variantsHaveChanged(prev: any, next: any) {
    if (typeof next === "string") {
        return next !== prev
    } else if (isVariantLabels(next)) {
        return !shallowCompare(next, prev)
    }

    return false
}

interface TypeState {
    isActive: boolean
    protectedKeys: { [key: string]: true }
    prevResolvedValues: { [key: string]: any }
    prevProp?: VariantLabels | TargetAndTransition
}

function createTypeState(isActive = false): TypeState {
    return {
        isActive,
        protectedKeys: {},
        prevResolvedValues: {},
    }
}

function createState() {
    return {
        [AnimationType.Animate]: createTypeState(true),
        [AnimationType.Hover]: createTypeState(),
        [AnimationType.Press]: createTypeState(),
        [AnimationType.Drag]: createTypeState(),
        [AnimationType.Exit]: createTypeState(),
    }
}
