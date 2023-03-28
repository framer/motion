import { resolveElements } from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { MotionValue } from "../value"
import { GroupPlaybackControls } from "./GroupPlaybackControls"
import {
    AnimationOptionsWithValueOverrides,
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicOption,
    ElementOrSelector,
    ValueAnimationTransition,
} from "./types"
import { isDOMKeyframes } from "./utils/is-dom-keyframes"
import { animateTarget } from "./interfaces/visual-element-target"
import { GenericKeyframesTarget, TargetAndTransition } from "../types"
import { createVisualElement } from "./utils/create-visual-element"
import { animateSingleValue } from "./interfaces/single-value"
import { AnimationSequence, SequenceOptions } from "./sequence/types"
import { createAnimationsFromSequence } from "./sequence/create"
import { isMotionValue } from "../value/utils/is-motion-value"

export interface DynamicAnimationOptions
    extends Omit<AnimationOptionsWithValueOverrides, "delay"> {
    delay?: number | DynamicOption<number>
}

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions,
    scope?: AnimationScope
): AnimationPlaybackControls {
    const elements = resolveElements(elementOrSelector, scope)
    const numElements = elements.length

    invariant(Boolean(numElements), "No valid element provided.")

    const animations: AnimationPlaybackControls[] = []

    for (let i = 0; i < numElements; i++) {
        const element = elements[i]

        /**
         * Check each element for an associated VisualElement. If none exists,
         * we need to create one.
         */
        if (!visualElementStore.has(element)) {
            /**
             * TODO: We only need render-specific parts of the VisualElement.
             * With some additional work the size of the animate() function
             * could be reduced significantly.
             */
            createVisualElement(element as HTMLElement | SVGElement)
        }

        const visualElement = visualElementStore.get(element)!

        const transition = { ...options }

        /**
         * Resolve stagger function if provided.
         */
        if (typeof transition.delay === "function") {
            transition.delay = transition.delay(i, numElements)
        }

        animations.push(
            ...animateTarget(
                visualElement,
                { ...keyframes, transition } as TargetAndTransition,
                {}
            )
        )
    }

    return new GroupPlaybackControls(animations)
}

const isSequence = (value: unknown): value is AnimationSequence =>
    Array.isArray(value) && Array.isArray(value[0])

function animateSequence(
    sequence: AnimationSequence,
    options?: SequenceOptions,
    scope?: AnimationScope
) {
    const animations: AnimationPlaybackControls[] = []
    const animationDefinitions = createAnimationsFromSequence(
        sequence,
        options,
        scope
    )

    animationDefinitions.forEach(({ keyframes, transition }, subject) => {
        let animation: AnimationPlaybackControls

        if (isMotionValue(subject)) {
            animation = animateSingleValue(
                subject,
                keyframes.default,
                transition.default
            )
        } else {
            animation = animateElements(subject, keyframes, transition, scope)
        }

        animations.push(animation)
    })

    return new GroupPlaybackControls(animations)
}

export const createScopedAnimate = (scope?: AnimationScope) => {
    /**
     * Animate a single value
     */
    function scopedAnimate<V>(
        from: V,
        to: V | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V>
    ): AnimationPlaybackControls
    /**
     * Animate a MotionValue
     */
    function scopedAnimate<V>(
        value: MotionValue<V>,
        keyframes: V | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V>
    ): AnimationPlaybackControls
    /**
     * Animate DOM
     */
    function scopedAnimate(
        value: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DynamicAnimationOptions
    ): AnimationPlaybackControls
    /**
     * Animate sequences
     */
    function scopedAnimate(
        sequence: AnimationSequence,
        options?: SequenceOptions
    ): AnimationPlaybackControls
    /**
     * Implementation
     */
    function scopedAnimate<V>(
        valueOrElementOrSequence:
            | AnimationSequence
            | ElementOrSelector
            | MotionValue<V>
            | V,
        keyframes:
            | SequenceOptions
            | DOMKeyframesDefinition
            | V
            | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V> | DynamicAnimationOptions
    ): AnimationPlaybackControls {
        let animation: AnimationPlaybackControls

        if (isSequence(valueOrElementOrSequence)) {
            animation = animateSequence(
                valueOrElementOrSequence,
                keyframes as SequenceOptions,
                scope
            )
        } else if (isDOMKeyframes(keyframes)) {
            animation = animateElements(
                valueOrElementOrSequence as ElementOrSelector,
                keyframes,
                options as DynamicAnimationOptions | undefined,
                scope
            )
        } else {
            animation = animateSingleValue(
                valueOrElementOrSequence,
                keyframes as V | GenericKeyframesTarget<V>,
                options as ValueAnimationTransition<V> | undefined
            )
        }

        if (scope) {
            scope.animations.push(animation)
        }

        return animation
    }

    return scopedAnimate
}

export const animate = createScopedAnimate()
