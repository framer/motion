import { resolveElements } from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { MotionValue } from "../value"
import { GroupPlaybackControls } from "./GroupPlaybackControls"
import {
    AnimateOptions,
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicOption,
    ElementOrSelector,
} from "./types"
import { isDOMKeyframes } from "./utils/is-dom-keyframes"
import { animateTarget } from "./interfaces/visual-element-target"
import { GenericKeyframesTarget } from "../types"
import { createVisualElement } from "./utils/create-visual-element"
import { animateSingleValue } from "./interfaces/single-value"

export interface Stagger {
    delay?: number | DynamicOption<number>
}

export type DOMAnimationOptions = Omit<AnimateOptions<any>, "delay"> & Stagger

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: DOMAnimationOptions,
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

        /**
         * Resolve stagger function if provided.
         */
        if (typeof options.delay === "function") {
            options.delay = options.delay(i, numElements)
        }

        animations.push(
            ...animateTarget(
                visualElement,
                { ...keyframes, transition: options } as any,
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
        options?: AnimateOptions<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        from: number,
        to: number | GenericKeyframesTarget<number>,
        options?: AnimateOptions<number>
    ): AnimationPlaybackControls
    /**
     * Animate a MotionValue
     */
    function scopedAnimate(
        value: MotionValue<string>,
        keyframes: string | GenericKeyframesTarget<string>,
        options?: AnimateOptions<string>
    ): AnimationPlaybackControls
    function scopedAnimate(
        value: MotionValue<number>,
        keyframes: number | GenericKeyframesTarget<number>,
        options?: AnimateOptions<number>
    ): AnimationPlaybackControls
    /**
     * Animate DOM
     */
    function scopedAnimate(
        value: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DOMAnimationOptions
    ): AnimationPlaybackControls
    function scopedAnimate<V>(
        valueOrElement: ElementOrSelector | MotionValue<V> | V,
        keyframes: DOMKeyframesDefinition | V | GenericKeyframesTarget<V>,
        options?: AnimateOptions<V> | DOMAnimationOptions
    ): AnimationPlaybackControls {
        let animation: AnimationPlaybackControls

        if (isDOMKeyframes(keyframes)) {
            animation = animateElements(
                valueOrElement as ElementOrSelector,
                keyframes,
                options as DOMAnimationOptions,
                scope
            )
        } else {
            animation = animateSingleValue(
                valueOrElement,
                keyframes,
                options as AnimateOptions<V>
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
