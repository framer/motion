import { getAnimatableNone } from "../../render/dom/value-types/animatable-none"
import { Transition } from "../../types"
import { MotionValue } from "../../value"
import { ValueKeyframesDefinition } from "../types"
import { isAnimatable } from "./is-animatable"
import { isNone } from "./is-none"

export function getKeyframes(
    value: MotionValue,
    valueName: string,
    target: ValueKeyframesDefinition,
    transition: Transition
): string[] | number[] {
    const isTargetAnimatable = isAnimatable(valueName, target)
    let keyframes: ValueKeyframesDefinition

    if (Array.isArray(target)) {
        keyframes = [...target]
    } else {
        keyframes = [null, target]
    }

    const defaultOrigin =
        transition.from !== undefined ? transition.from : value.get()

    let animatableTemplateValue: string | undefined = undefined
    const noneKeyframeIndexes: number[] = []

    for (let i = 0; i < keyframes.length; i++) {
        /**
         * Fill null/wildcard keyframes
         */
        if (keyframes[i] === null) {
            keyframes[i] = i === 0 ? defaultOrigin : keyframes[i - 1]
        }

        if (isNone(keyframes[i])) {
            noneKeyframeIndexes.push(i)
        }
        if (typeof keyframes[i] === "string" && keyframes[i] !== "none") {
            animatableTemplateValue = keyframes[i] as string
        }
    }

    if (
        isTargetAnimatable &&
        noneKeyframeIndexes.length &&
        animatableTemplateValue
    ) {
        for (let i = 0; i < noneKeyframeIndexes.length; i++) {
            const index = noneKeyframeIndexes[i]
            keyframes[index] = getAnimatableNone(
                valueName,
                animatableTemplateValue
            )
        }
    }

    return keyframes as string[] | number[]
}
