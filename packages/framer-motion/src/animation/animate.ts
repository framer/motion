import { createMotionValueAnimation } from "."
import { resolveElements } from "../render/dom/utils/resolve-element"
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
import { getValueOptions } from "./utils/get-value-options"
import { isDOMKeyframes } from "./utils/is-dom-keyframes"

function animateSingleValue<V>(
    value: MotionValue<V> | V,
    keyframes: V | V[],
    options: AnimateOptions<V>
): AnimationPlaybackControls {
    const motionValue = isMotionValue(value) ? value : createMotionValue(value)
    motionValue.start(
        createMotionValueAnimation("", motionValue, keyframes as any, options)
    )

    return motionValue.animation!
}

function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: AnimateOptions<any>
): AnimationPlaybackControls {
    const elements = resolveElements(elementOrSelector)
    const numElements = elements.length

    invariant(Boolean(numElements), "No valid element provided.")
    invariant(Boolean(keyframes), "No keyframes defined.")

    const animations: AnimationPlaybackControls[] = []

    for (let i = 0; i < numElements; i++) {
        const element = elements[i]

        /**
         * Check each element for an associated VisualElement. If none exists,
         * we need to create one.
         */
        // if (!visualElementStore.has(element)) {
        //     const options = {
        //         presenceContext : null,
        //         props: {},
        //         visualState:
        //     }
        //     const node = isSVGElement(element) ? new SVGVisualElement(options, { enableHardwareAcceleration: true }) : new HTMLVisualElement(options, { enableHardwareAcceleration: true })
        //     visualElementStore.set(element, )
        // }

        const visualElement = visualElementStore.get(element)!

        /**
         * Loop over every value defined in keyframes and make a new animation
         * for this element/value combination.
         */
        for (const key in keyframes) {
            const valueOptions = getValueOptions(options, key)
            const motionValue = visualElement.getValue(key)

            // TODO: Loop over options and resolve based on element index

            animations.push(
                animateSingleValue(motionValue, keyframes[key], valueOptions)
            )
        }
    }

    return new GroupPlaybackControls(animations)
}

/**
 * Animate a single value
 */
export function animate<V>(
    from: V,
    to: V | V[],
    options: AnimateOptions<V>
): AnimationPlaybackControls
/**
 * Animate a MotionValue
 */
export function animate<V>(
    value: MotionValue<V>,
    keyframes: V | V[],
    options: AnimateOptions<V>
): AnimationPlaybackControls
/**
 * Animate DOM
 */
export function animate<V>(
    value: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options: AnimateOptions<V>
): AnimationPlaybackControls
export function animate<V>(
    valueOrElement: ElementOrSelector | MotionValue<V> | V,
    keyframes: DOMKeyframesDefinition | V | V[],
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
