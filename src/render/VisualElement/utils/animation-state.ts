import { VisualElement } from ".."
import { AnimationControls } from "../../../animation/AnimationControls"
import { MotionProps } from "../../../motion"
import { VariantContextProps } from "../../../motion/context/MotionContext"
import { VariantLabels } from "../../../motion/types"
import { TargetAndTransition } from "../../../types"
import { shallowCompare } from "../../../utils/shallow-compare"
import {
    animateVisualElement,
    AnimationDefinition,
    AnimationOptions,
} from "./animation"
import { isVariantLabel, isVariantLabels, resolveVariant } from "./variants"

export interface AnimationState {
    setProps: (
        props: MotionProps,
        context?: VariantContextProps,
        options?: AnimationOptions,
        type?: AnimationType
    ) => Promise<any>
    setActive: (
        type: AnimationType,
        isActive: boolean,
        options?: AnimationOptions
    ) => Promise<any>
    setAnimateFunction: (fn: any) => void
    getProtectedKeys: (type: AnimationType) => { [key: string]: any }
}

interface DefinitionAndOptions {
    animation: AnimationDefinition
    options?: AnimationOptions
}

export enum AnimationType {
    Animate = "animate",
    Hover = "whileHover",
    Tap = "whileTap",
    Drag = "whileDrag",
    Focus = "whileFocus",
    Exit = "exit",
}

export type AnimationList = string[] | TargetAndTransition[]

export const variantPriorityOrder = [
    AnimationType.Animate,
    AnimationType.Hover,
    AnimationType.Tap,
    AnimationType.Drag,
    AnimationType.Focus,
    AnimationType.Exit,
]

const reversePriorityOrder = [...variantPriorityOrder].reverse()
const numAnimationTypes = variantPriorityOrder.length

function animateList(visualElement: VisualElement) {
    return (animations: DefinitionAndOptions[]) =>
        Promise.all(
            animations.map(({ animation, options }) =>
                animateVisualElement(visualElement, animation, options)
            )
        )
}

export function createAnimationState(
    visualElement: VisualElement
): AnimationState {
    let animate = animateList(visualElement)
    const state = createState()
    let isInitialRender = true

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
            acc = { ...acc, ...target, ...transitionEnd }
        }

        return acc
    }

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
        options?: AnimationOptions,
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
        const animations: DefinitionAndOptions[] = []

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

        // TODO Reconcile with other update config
        if (props.variants) {
            visualElement.updateConfig({
                ...(visualElement as any).config,
                variants: props.variants,
            } as any)
        }

        /**
         * If a variant has been removed at a given index, and this component is controlling
         * variant animations, we want to ensure lower-priority variants are forced to animate.
         */
        let removedVariantIndex = Infinity

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
            const propIsVariant = isVariantLabel(prop)

            /**
             * If this type has *just* changed isActive status, set activeDelta
             * to that status. Otherwise set to null.
             */
            const activeDelta =
                type === changedActiveType ? typeState.isActive : null

            if (activeDelta === false) removedVariantIndex = i

            /**
             * If this prop is an inherited variant, rather than been set directly on the
             * component itself, we want to make sure we allow the parent to trigger animations.
             */
            let isInherited = prop === context[type] && propIsVariant

            /**
             *
             */
            if (
                isInherited &&
                isInitialRender &&
                visualElement.manuallyAnimateOnMount
            ) {
                isInherited = false
            }

            /**
             * Resume from previous snapshot if it's the first render
             */
            if (
                isInitialRender &&
                type === AnimationType.Animate &&
                visualElement.prevSnapshot
            ) {
                isInitialRender = false
                typeState.prevResolvedValues = visualElement.prevSnapshot
            }

            /**
             * Set all encountered keys so far as the protected keys for this type. This will
             * be any key that has been animated or otherwise handled by active, higher-priortiy types.
             */
            typeState.protectedKeys = { ...encounteredKeys }

            // Check if we can skip analysing this prop early
            if (
                // If it isn't active and hasn't *just* been set as inactive
                (!typeState.isActive && activeDelta === null) ||
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
            let shouldAnimateType =
                variantsHaveChanged(typeState.prevProp, prop) ||
                // If we're making this variant active, we want to always make it active
                (type === changedActiveType &&
                    typeState.isActive &&
                    !isInherited &&
                    propIsVariant) ||
                // If we removed a higher-priority variant (i is in reverse order)
                (i > removedVariantIndex && propIsVariant)

            /**
             * As animations can be set as variant lists, variants or target objects, we
             * coerce everything to an array if it isn't one already
             */
            const definitionList = Array.isArray(prop) ? prop : [prop]

            /**
             * Build an object of all the resolved values. We'll use this in the subsequent
             * setProps calls to determine whether a value has changed.
             */
            let resolvedValues = definitionList.reduce(
                buildResolvedTypeValues,
                {}
            )

            if (activeDelta === false) resolvedValues = {}

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

                // If we've already handled this we can just skip ahead
                if (encounteredKeys.hasOwnProperty(key)) continue

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
             *
             */
            if (typeState.isActive) {
                encounteredKeys = { ...encounteredKeys, ...resolvedValues }
            }

            /**
             * If this is an inherited prop we want to hard-block animations
             * TODO: Test as this should probably still handle animations triggered
             * by removed values?
             */
            if (shouldAnimateType && !isInherited) {
                animations.push(
                    ...definitionList.map((animation) => ({
                        animation: animation as AnimationDefinition,
                        options: { type, ...options },
                    }))
                )
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
                const fallbackTarget = visualElement.getBaseValue(key, props)

                if (fallbackTarget !== undefined) {
                    fallbackAnimation[key] = fallbackTarget
                }
            })

            animations.push({ animation: fallbackAnimation })
        }

        let shouldAnimate = Boolean(animations.length)

        if (
            isInitialRender &&
            props.initial === false &&
            !visualElement.manuallyAnimateOnMount
        ) {
            shouldAnimate = false
        }

        isInitialRender = false
        return shouldAnimate ? animate(animations) : Promise.resolve()
    }

    /**
     * Change whether a certain animation type is active.
     */
    function setActive(
        type: AnimationType,
        isActive: boolean,
        options?: AnimationOptions
    ) {
        // If the active state hasn't changed, we can safely do nothing here
        if (state[type].isActive === isActive) return Promise.resolve()

        // Propagate active change to children
        visualElement.variantChildrenOrder?.forEach((child) =>
            child.animationState?.setActive(type, isActive)
        )

        state[type].isActive = isActive

        return setProps(currentProps, currentContext, options, type)
    }

    return { getProtectedKeys, setProps, setActive, setAnimateFunction }
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
        [AnimationType.Tap]: createTypeState(),
        [AnimationType.Drag]: createTypeState(),
        [AnimationType.Focus]: createTypeState(),
        [AnimationType.Exit]: createTypeState(),
    }
}
