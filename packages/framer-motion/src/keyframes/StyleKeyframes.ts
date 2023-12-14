import { Easing } from "../easing/types"
import { isEasingArray } from "../easing/utils/is-easing-array"
import { easingDefinitionToFunction } from "../easing/utils/map"
import { frame } from "../frameloop"
import type { VisualElement } from "../render/VisualElement"
import { getVariableValue } from "../render/dom/utils/css-variables-conversion"
import { isCSSVariableToken } from "../render/dom/utils/is-css-variable"
import {
    isNumOrPxType,
    positionalKeys,
    positionalValues,
    removeNonTranslationalTransform,
} from "../render/dom/utils/unit-conversion"
import { findDimensionValueType } from "../render/dom/value-types/dimensions"
import { interpolate } from "../utils/interpolate"
import { defaultOffset } from "../utils/offsets/default"

export interface KeyframeOptions {
    ease?: Easing | Easing[]
    times?: number[]
}

export type UnresolvedKeyframes<T> = Array<T | null>

const isNull = (v: any): v is null => v === null

export class StyleKeyframes<T extends string | number = number> {
    private sample: (v: number) => T

    finalKeyframe: string | number

    constructor(
        element: VisualElement<HTMLElement>,
        valueName: string,
        keyframes: UnresolvedKeyframes<T>,
        {
            ease = "easeInOut",
            times = defaultOffset(keyframes),
        }: KeyframeOptions
    ) {
        let resolvedKeyframes: Array<string | number>

        frame.read(() => {
            if (!element.current) return

            /**
             * If the first keyframe is null, we need to find its value by sampling the element
             */
            if (isNull(keyframes[0])) {
                keyframes[0] = element.readValue(valueName) as T
            }

            /**
             * If any keyframe is a CSS variable, we need to find its value by sampling the element
             */
            for (let i = 0; i < keyframes.length; i++) {
                const keyframe = keyframes[i]
                if (isCSSVariableToken(keyframe)) {
                    const resolved = getVariableValue(keyframe, element.current)
                    if (resolved !== undefined) {
                        keyframes[i] = resolved as T
                    }

                    // If this variable is the final keyframe, set it as finalKeyframe
                    if (i === keyframes.length - 1) {
                        this.finalKeyframe = keyframe
                    }
                }
            }

            // TODO: Fill nulls forward here
            resolvedKeyframes = keyframes as T[]

            /**
             * Check to see if unit type has changed. If so schedule jobs that will
             * temporarily set styles to the destination keyframes.
             * Skip if we have more than two keyframes or this isn't a positional value.
             * TODO: We can throw if there are multiple keyframes and the value type changes.
             */
            if (
                !positionalKeys.has(valueName) ||
                keyframes.length !== 2 ||
                isCSSVariableToken(
                    resolvedKeyframes[resolvedKeyframes.length - 1]
                )
            ) {
                return
            }

            const [origin, target] = resolvedKeyframes
            const originType = findDimensionValueType(origin)
            const targetType = findDimensionValueType(target)

            if (!originType || !targetType || originType === targetType) return

            /**
             * If both values are numbers or pixels, we can animate between them by
             * converting them to numbers.
             */
            if (isNumOrPxType(originType) && isNumOrPxType(targetType)) {
                resolvedKeyframes = resolvedKeyframes.map((v) =>
                    typeof v === "string" ? parseFloat(v) : v
                )
            } else if (
                originType.transform &&
                targetType.transform &&
                origin === 0 &&
                target === 0
            ) {
                /**
                 * If one value or the other is 0, it's safe to coerce without
                 * measurement.
                 */
                if (origin === 0) {
                    keyframes[0] = targetType.transform!(0)
                } else if (target === 0) {
                    keyframes[keyframes.length - 1] = originType.transform!(0)
                }
            } else {
                let unsetTransforms
                let scrollY: number
                let origin

                /**
                 * We can't coerce so now we need to do value conversion via DOM measurements.
                 */
                frame.unsetTransforms(() => {
                    if (!element.current) return

                    unsetTransforms = removeNonTranslationalTransform(element)

                    if (this.finalKeyframe === undefined) {
                        this.finalKeyframe = target
                    }

                    element.getValue(valueName, target).jump(target)
                })

                frame.measure(() => {
                    if (!element.current) return

                    if (valueName === "height") {
                        scrollY = window.pageYOffset
                    }

                    const originBbox = element.measureViewportBox()
                    const computedStyle = window.getComputedStyle(
                        element.current
                    )

                    if (computedStyle.display === "none") {
                        element.setStaticValue(
                            "display",
                            (target.display as string) || "block"
                        )
                    }

                    origin = positionalValues[valueName](
                        originBbox,
                        computedStyle
                    )
                })

                frame.renderTemporaryStyles(element.render)

                frame.readTemporaryStyles(() => {
                    if (!element.current) return

                    const targetBbox = element.measureViewportBox()
                    const value = element.getValue(valueName)
                    value && value.jump(origin)
                    resolvedKeyframes[resolvedKeyframes.length - 1] =
                        positionalValues[valueName](
                            targetBbox,
                            window.getComputedStyle(element.current)
                        )

                    // If we removed transform values, reapply them before the next render
                    if (unsetTransforms.length) {
                        unsetTransforms.forEach(([key, value]) => {
                            element.getValue(key)!.set(value)
                        })
                    }
                })

                if (scrollY !== undefined) {
                    // TODO: Move this to some kind of globally shared function like suspend and restore scroll
                    frame.render(() => {
                        window.scrollTo({ top: scrollY })
                    })
                }

                frame.render(element.render)
            }
        })

        frame.render(() => {
            /**
             * Easing functions can be externally defined as strings. Here we convert them
             * into actual functions.
             */
            const easingFunctions = isEasingArray(ease)
                ? ease.map(easingDefinitionToFunction)
                : easingDefinitionToFunction(ease)

            /**
             * Create interpolate function based off the processed keyframes.
             */
            this.sample = interpolate(resolvedKeyframes, times, easingFunctions)
        })
    }
}
