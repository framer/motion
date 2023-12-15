import { isNone } from "../../../animation/utils/is-none"
import {
    ResolvedKeyframes,
    UnresolvedKeyframes,
} from "../../../keyframes/Keyframes"
import { VisualElement } from "../../VisualElement"
import { getVariableValue } from "../../dom/utils/css-variables-conversion"
import { isCSSVariableToken } from "../../dom/utils/is-css-variable"
import {
    isNumOrPxType,
    positionalKeys,
    positionalValues,
    removeNonTranslationalTransform,
} from "../../dom/utils/unit-conversion"
import { findDimensionValueType } from "../../dom/value-types/dimensions"
import { KeyframeResolver } from "../../utils/KeyframesResolver"
import { makeNoneKeyframesAnimatable } from "./make-none-animatable"

/**
 * TODO: Use information about whether we are animating via JS or WAAPI to
 * decide whether to we need to resolve CSS vars / do type conversion here.
 */
export class HTMLKeyframesResolver<
    T extends string | number
> extends KeyframeResolver {
    private element: VisualElement<HTMLElement>
    private name: string
    private removedTransforms?: [string, string | number][]
    private restoreScrollY?: number
    private measuredOrigin?: string | number
    unresolvedKeyframes: UnresolvedKeyframes<string | number>

    constructor(
        element: VisualElement<HTMLElement>,
        name: string,
        unresolvedKeyframes: UnresolvedKeyframes<T>,
        onComplete: (resolvedKeyframes: ResolvedKeyframes<T>) => void
    ) {
        super(unresolvedKeyframes, onComplete)
        this.element = element
        this.name = name
    }

    readKeyframes() {
        const { unresolvedKeyframes, element, name } = this

        if (!element.current) return

        const noneKeyframeIndexes: number[] = []

        /**
         * If any keyframe is a CSS variable, we need to find its value by sampling the element
         */
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
            if (unresolvedKeyframes[i] === null) {
                /**
                 * If the first keyframe is null, we need to find its value by sampling the element
                 */
                if (i === 0) {
                    unresolvedKeyframes[0] = element.readValue(name) as T
                } else {
                    unresolvedKeyframes[i] = unresolvedKeyframes[i - 1]
                }
            }

            const keyframe = unresolvedKeyframes[i]
            if (isCSSVariableToken(keyframe)) {
                const resolved = getVariableValue(keyframe, element.current)
                if (resolved !== undefined) {
                    unresolvedKeyframes[i] = resolved as T
                }

                // If this variable is the final keyframe, set it as finalKeyframe
                if (i === unresolvedKeyframes.length - 1) {
                    // this.resolvedFinalKeyframe = keyframe
                }
            }

            if (isNone(unresolvedKeyframes[i])) {
                noneKeyframeIndexes.push(i)
            }
        }

        if (noneKeyframeIndexes.length) {
            makeNoneKeyframesAnimatable(
                unresolvedKeyframes,
                noneKeyframeIndexes,
                name
            )
        }

        /**
         * Check to see if unit type has changed. If so schedule jobs that will
         * temporarily set styles to the destination keyframes.
         * Skip if we have more than two keyframes or this isn't a positional value.
         * TODO: We can throw if there are multiple keyframes and the value type changes.
         */
        if (!positionalKeys.has(name) || unresolvedKeyframes.length !== 2) {
            return
        }

        const [origin, target] = unresolvedKeyframes
        const originType = findDimensionValueType(origin)
        const targetType = findDimensionValueType(target)

        /**
         * Either we don't recognise these value types or we can animate between them.
         */
        if (!originType || !targetType || originType === targetType) return

        /**
         * If both values are numbers or pixels, we can animate between them by
         * converting them to numbers.
         */
        if (isNumOrPxType(originType) && isNumOrPxType(targetType)) {
            for (let i = 0; i < unresolvedKeyframes.length; i++) {
                const value = unresolvedKeyframes[i]
                if (typeof value === "string") {
                    unresolvedKeyframes[i] = parseFloat(value as string)
                }
            }
        } else {
            /**
             * Else, the only way to resolve this is by measuring the element.
             */
            this.needsMeasurement = true
        }
    }

    unsetTransforms() {
        const { element, name, unresolvedKeyframes } = this

        if (!element.current) return

        this.removedTransforms = removeNonTranslationalTransform(element)

        const finalKeyframe =
            unresolvedKeyframes[unresolvedKeyframes.length - 1]

        // if (this.resolvedFinalKeyframe === undefined) {
        //     this.resolvedFinalKeyframe = finalKeyframe
        // }

        element.getValue(name, finalKeyframe).jump(finalKeyframe)
    }

    measureInitialState() {
        const { element, name } = this

        if (!element.current) return

        if (name === "height") {
            this.restoreScrollY = window.pageYOffset
        }

        this.measuredOrigin = positionalValues[name](
            element.measureViewportBox(),
            window.getComputedStyle(element.current)
        )
    }

    renderEndStyles() {
        this.element.render()
    }

    measureEndState() {
        const { element, name, unresolvedKeyframes } = this

        if (!element.current) return

        const value = element.getValue(name)
        value && value.jump(this.measuredOrigin)

        unresolvedKeyframes[unresolvedKeyframes.length - 1] = positionalValues[
            name
        ](
            element.measureViewportBox(),
            window.getComputedStyle(element.current)
        ) as any

        // If we removed transform values, reapply them before the next render
        if (this.removedTransforms?.length) {
            this.removedTransforms.forEach(
                ([unsetTransformName, unsetTransformValue]) => {
                    element
                        .getValue(unsetTransformName)!
                        .set(unsetTransformValue)
                }
            )
        }
    }
}
