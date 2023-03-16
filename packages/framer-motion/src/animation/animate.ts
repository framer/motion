import { resolveElements } from "../render/dom/utils/resolve-element"
import { visualElementStore } from "../render/store"
import { invariant } from "../utils/errors"
import { MotionValue } from "../value"
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
import { animateSingleValue } from "./interfaces/single-value"

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: AnimateOptions<any>
): AnimationPlaybackControls {
    const elements = resolveElements(elementOrSelector)
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

/**
 * Animate a single value
 */
export function animate(
    from: string,
    to: string | GenericKeyframesTarget<string>,
    options?: AnimateOptions<string>
): AnimationPlaybackControls
export function animate(
    from: number,
    to: number | GenericKeyframesTarget<number>,
    options?: AnimateOptions<number>
): AnimationPlaybackControls
/**
 * Animate a MotionValue
 */
export function animate(
    value: MotionValue<string>,
    keyframes: string | GenericKeyframesTarget<string>,
    options?: AnimateOptions<string>
): AnimationPlaybackControls
export function animate(
    value: MotionValue<number>,
    keyframes: number | GenericKeyframesTarget<number>,
    options?: AnimateOptions<number>
): AnimationPlaybackControls
/**
 * Animate DOM
 */
export function animate<V>(
    value: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: AnimateOptions<V>
): AnimationPlaybackControls
export function animate<V>(
    valueOrElement: ElementOrSelector | MotionValue<V> | V,
    keyframes: DOMKeyframesDefinition | V | GenericKeyframesTarget<V>,
    options: AnimateOptions<V> = {}
): AnimationPlaybackControls {
    if (isDOMKeyframes(keyframes)) {
        return animateElements(
            valueOrElement as ElementOrSelector,
            keyframes,
            options
        )
    } else {
        return animateSingleValue(valueOrElement, keyframes, options)
    }
}
