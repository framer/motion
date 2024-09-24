import { resolveElements } from "../../../render/dom/utils/resolve-element"
import { invariant } from "../../../utils/errors"
import { secondsToMilliseconds } from "../../../utils/time-conversion"
import { GroupPlaybackControls } from "../../GroupPlaybackControls"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
    Transition,
} from "../../types"
import { getValueTransition } from "../../utils/transitions"
import { NativeAnimation } from "./NativeAnimation"

function animateElement(
    element: Element,
    keyframes: DOMKeyframesDefinition,
    options: Transition
): AnimationPlaybackControls[] {
    const animations: AnimationPlaybackControls[] = []

    for (const valueName in keyframes) {
        const valueKeyframes = keyframes[valueName as keyof typeof keyframes]!
        const valueOptions = getValueTransition(options as any, valueName)

        if (options.duration) {
            options.duration = secondsToMilliseconds(options.duration)
        }
        if (options.delay) {
            options.delay = secondsToMilliseconds(options.delay || 0)
        }

        animations.push(
            new NativeAnimation(
                element,
                valueName,
                valueKeyframes,
                valueOptions
            )
        )
    }

    return animations
}

export const createScopedWaapiAnimate = (scope?: AnimationScope) => {
    // TODO: This could be combined with the function in animation/animate
    return (
        elementOrSelector: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DynamicAnimationOptions
    ): AnimationPlaybackControls => {
        const elements = resolveElements(elementOrSelector, scope)
        const numElements = elements.length

        invariant(Boolean(numElements), "No valid element provided.")

        const animations: AnimationPlaybackControls[] = []

        for (let i = 0; i < numElements; i++) {
            const element = elements[i]
            const elementTransition = { ...options }

            /**
             * Resolve stagger function if provided.
             */
            if (typeof elementTransition.delay === "function") {
                elementTransition.delay = elementTransition.delay(
                    i,
                    numElements
                )
            }

            animations.push(
                ...animateElement(
                    element,
                    keyframes,
                    elementTransition as Transition
                )
            )
        }

        return new GroupPlaybackControls(animations)
    }
}

export const animateDom = createScopedWaapiAnimate()
