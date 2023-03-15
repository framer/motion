import { animateMotionValue } from "./interfaces/motion-value"
import {
    GetAnimateScope,
    resolveElements,
} from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { motionValue as createMotionValue, MotionValue } from "../value"
import { isMotionValue } from "../value/utils/is-motion-value"
import { GroupPlaybackControls } from "./GroupPlaybackControls"
import {
    AnimateOptions,
    AnimationPlaybackControls,
    DOMKeyframesDefinition,
    ElementOrSelector,
} from "./types"
import { isDOMKeyframes } from "./utils/is-dom-keyframes"
import { animateTarget } from "./interfaces/visual-element-target"
import { GenericKeyframesTarget } from "../types"
import { createVisualElement } from "./utils/create-visual-element"

function animateSingleValue<V>(
    value: MotionValue<V> | V,
    keyframes: V | GenericKeyframesTarget<V>,
    options: AnimateOptions<V>
): AnimationPlaybackControls {
    const motionValue = isMotionValue(value) ? value : createMotionValue(value)

    motionValue.start(
        animateMotionValue("", motionValue, keyframes as any, options)
    )

    return motionValue.animation!
}

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: AnimateOptions<any>,
    getScope?: GetAnimateScope
): AnimationPlaybackControls {
    const elements = resolveElements(elementOrSelector, getScope)
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

export const createScopedAnimate = (getScope?: GetAnimateScope) => {
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
    function scopedAnimate<V>(
        value: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: AnimateOptions<V>
    ): AnimationPlaybackControls
    function scopedAnimate<V>(
        valueOrElement: ElementOrSelector | MotionValue<V> | V,
        keyframes: DOMKeyframesDefinition | V | GenericKeyframesTarget<V>,
        options: AnimateOptions<V> = {}
    ): AnimationPlaybackControls {
        if (isDOMKeyframes(keyframes)) {
            return animateElements(
                valueOrElement as ElementOrSelector,
                keyframes,
                options,
                getScope
            )
        } else {
            return animateSingleValue(valueOrElement, keyframes, options)
        }
    }

    return scopedAnimate
}

export const animate = createScopedAnimate()
