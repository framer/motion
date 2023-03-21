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

export const createScopedAnimate = (scope?: AnimationScope) => {
    /**
     * Animate a single value
     */
    function scopedAnimate(
        from: string,
        to: string | GenericKeyframesTarget<string>,
        options?: ValueAnimationTransition<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        from: number,
        to: number | GenericKeyframesTarget<number>,
        options?: ValueAnimationTransition<number>
    ): AnimationPlaybackControls
    function scopedAnimate<V>(
        from: V,
        to: V | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V>
    ): AnimationPlaybackControls
    /**
     * Animate a MotionValue
     */
    function scopedAnimate(
        value: MotionValue<string>,
        keyframes: string | GenericKeyframesTarget<string>,
        options?: ValueAnimationTransition<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        value: MotionValue<number>,
        keyframes: number | GenericKeyframesTarget<number>,
        options?: ValueAnimationTransition<number>
    ): AnimationPlaybackControls
    /**
     * Animate DOM
     */
    function scopedAnimate(
        value: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DynamicAnimationOptions
    ): AnimationPlaybackControls
    function scopedAnimate<V>(
        valueOrElement: ElementOrSelector | MotionValue<V> | V,
        keyframes: DOMKeyframesDefinition | V | GenericKeyframesTarget<V>,
        options?: ValueAnimationTransition<V> | DynamicAnimationOptions
    ): AnimationPlaybackControls {
        let animation: AnimationPlaybackControls

        if (isDOMKeyframes(keyframes)) {
            animation = animateElements(
                valueOrElement as ElementOrSelector,
                keyframes,
                options as DynamicAnimationOptions | undefined,
                scope
            )
        } else {
            animation = animateSingleValue(
                valueOrElement,
                keyframes,
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
