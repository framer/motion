import { resolveElements } from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { MotionValue } from "../value"
import { GroupPlaybackControls } from "./GroupPlaybackControls"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
    ValueAnimationTransition,
} from "./types"
import { animateTarget } from "./interfaces/visual-element-target"
import { GenericKeyframesTarget, TargetAndTransition } from "../types"
import {
    createDOMVisualElement,
    createObjectVisualElement,
} from "./utils/create-visual-element"
import { animateSingleValue } from "./interfaces/single-value"
import { AnimationSequence, SequenceOptions } from "./sequence/types"
import { createAnimationsFromSequence } from "./sequence/create"
import { isMotionValue } from "../value/utils/is-motion-value"
import { spring } from "./generators/spring"

type VisualElementFactory = (subject: any) => void

function animateSubjects(
    createVisualElement: VisualElementFactory,
    subjects: any[],
    keyframes: { [key: string]: GenericKeyframesTarget<string | number> },
    options?: DynamicAnimationOptions
) {
    const numSubjects = subjects.length

    invariant(Boolean(numSubjects), "No valid animation subjects provided.")

    const animations: AnimationPlaybackControls[] = []

    for (let i = 0; i < numSubjects; i++) {
        const subject = subjects[i]

        /**
         * Check each element for an associated VisualElement. If none exists,
         * we need to create one.
         */
        if (!visualElementStore.has(subject)) {
            createVisualElement(subject)
        }

        const visualElement = visualElementStore.get(subject)!

        const transition = { ...options }

        /**
         * Resolve stagger function if provided.
         */
        if (typeof transition.delay === "function") {
            transition.delay = transition.delay(i, numSubjects)
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

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions,
    scope?: AnimationScope
) {
    const elements = resolveElements(elementOrSelector, scope)
    return animateSubjects(createDOMVisualElement, elements, keyframes, options)
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
        scope,
        { spring }
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
            animation = animateElements(subject, keyframes, transition)
        }

        animations.push(animation)
    })

    return new GroupPlaybackControls(animations)
}

type ObjectTarget<O extends Object> = {
    [K in keyof O]: O[K] | GenericKeyframesTarget<O[K]>
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
     * Animate an object
     */
    function scopedAnimate<O extends Object>(
        from: O,
        to: ObjectTarget<O>,
        options?: DynamicAnimationOptions
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
    function scopedAnimate<V extends string | number, O extends Object>(
        subject: AnimationSequence | ElementOrSelector | MotionValue<V> | V | O,
        keyframes:
            | SequenceOptions
            | DOMKeyframesDefinition
            | V
            | ObjectTarget<O>
            | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V> | DynamicAnimationOptions
    ): AnimationPlaybackControls {
        let animation: AnimationPlaybackControls

        if (isSequence(subject)) {
            animation = animateSequence(
                subject,
                keyframes as SequenceOptions,
                scope
            )
        } else if (
            subject instanceof Element ||
            (Array.isArray(subject) && subject[0] instanceof Element) ||
            (typeof subject === "string" && typeof keyframes === "object")
        ) {
            animation = animateElements(
                subject as ElementOrSelector,
                keyframes as DOMKeyframesDefinition,
                options as DynamicAnimationOptions | undefined,
                scope
            )
        } else if (typeof subject === "object") {
            animation = animateSubjects(
                createObjectVisualElement,
                subject as O,
                keyframes as ObjectTarget<O>,
                options as DynamicAnimationOptions
            )
        } else {
            animation = animateSingleValue(
                subject as MotionValue<V> | V,
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
