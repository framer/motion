import { resolveElements } from "../../render/dom/utils/resolve-element"
import { visualElementStore } from "../../render/store"
import { GenericKeyframesTarget, TargetAndTransition } from "../../types"
import { invariant } from "../../utils/errors"
import type { MotionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { animateTarget } from "../interfaces/visual-element-target"
import { ObjectTarget } from "../sequence/types"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
    ValueAnimationTransition,
} from "../types"
import {
    createDOMVisualElement,
    createObjectVisualElement,
} from "../utils/create-visual-element"
import { animateSingleValue } from "./single-value"

export type AnimationSubject = Element | MotionValue<any> | any

function isSingleValue(
    subject: unknown,
    keyframes: unknown
): subject is MotionValue | string | number {
    return (
        isMotionValue(subject) ||
        (typeof subject === "string" && typeof keyframes !== "object") ||
        typeof subject === "number"
    )
}

/**
 * Animate a string
 */
export function animateSubject(
    value: string | MotionValue<string>,
    keyframes: string | GenericKeyframesTarget<string>,
    options?: ValueAnimationTransition<string>
): AnimationPlaybackControls[]
/**
 * Animate a number
 */
export function animateSubject(
    value: number | MotionValue<number>,
    keyframes: number | GenericKeyframesTarget<number>,
    options?: ValueAnimationTransition<number>
): AnimationPlaybackControls[]
/**
 * Animate a Element
 */
export function animateSubject(
    element: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions,
    scope?: AnimationScope
): AnimationPlaybackControls[]
/**
 * Animate a object
 */
export function animateSubject<O extends Object>(
    object: O | O[],
    keyframes: ObjectTarget<O>,
    options?: DynamicAnimationOptions
): AnimationPlaybackControls[]
/**
 * Implementation
 */
export function animateSubject<O extends Object>(
    subject:
        | MotionValue<number>
        | MotionValue<string>
        | number
        | string
        | ElementOrSelector
        | O
        | O[],
    keyframes:
        | number
        | string
        | GenericKeyframesTarget<number>
        | GenericKeyframesTarget<string>
        | DOMKeyframesDefinition
        | ObjectTarget<O>,
    options?:
        | ValueAnimationTransition<number>
        | ValueAnimationTransition<string>
        | DynamicAnimationOptions,
    scope?: AnimationScope
): AnimationPlaybackControls[] {
    const animations: AnimationPlaybackControls[] = []

    if (isSingleValue(subject, keyframes)) {
        animations.push(
            animateSingleValue(subject, keyframes as any, options as any)
        )
    } else {
        let subjects: Array<O | Element>

        if (typeof subject === "string") {
            subjects = resolveElements(subject, scope)
        } else if (subject instanceof NodeList) {
            subjects = Array.from(subject)
        } else if (Array.isArray(subject)) {
            subjects = subject
        } else {
            subjects = [subject]
        }

        const numSubjects = subjects.length

        invariant(Boolean(numSubjects), "No valid elements provided.")

        for (let i = 0; i < numSubjects; i++) {
            const thisSubject = subjects[i]

            const createVisualElement =
                thisSubject instanceof Element
                    ? createDOMVisualElement
                    : createObjectVisualElement

            if (!visualElementStore.has(thisSubject)) {
                createVisualElement(thisSubject as any)
            }

            const visualElement = visualElementStore.get(thisSubject)!

            const transition = { ...options }

            /**
             * Resolve stagger function if provided.
             */
            if (
                "delay" in transition &&
                typeof transition.delay === "function"
            ) {
                transition.delay = transition.delay(i, numSubjects)
            }

            animations.push(
                ...animateTarget(
                    visualElement,
                    { ...(keyframes as {}), transition } as TargetAndTransition,
                    {}
                )
            )
        }
    }

    return animations
}
