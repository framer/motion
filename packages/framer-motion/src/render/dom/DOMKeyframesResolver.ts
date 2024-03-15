import { isNone } from "../../animation/utils/is-none"
import { getVariableValue } from "./utils/css-variables-conversion"
import { isCSSVariableToken } from "./utils/is-css-variable"
import {
    isNumOrPxType,
    positionalKeys,
    positionalValues,
    removeNonTranslationalTransform,
} from "./utils/unit-conversion"
import { findDimensionValueType } from "./value-types/dimensions"
import {
    KeyframeResolver,
    OnKeyframesResolved,
    UnresolvedKeyframes,
} from "../utils/KeyframesResolver"
import { makeNoneKeyframesAnimatable } from "../html/utils/make-none-animatable"
import { VisualElement } from "../VisualElement"
import { MotionValue } from "../../value"

export class DOMKeyframesResolver<
    T extends string | number
> extends KeyframeResolver<T> {
    name: string
    protected element: VisualElement<HTMLElement | SVGElement>

    private removedTransforms?: [string, string | number][]
    private measuredOrigin?: string | number
    private suspendedScrollY?: number

    constructor(
        unresolvedKeyframes: UnresolvedKeyframes<string | number>,
        onComplete: OnKeyframesResolved<T>,
        name?: string,
        motionValue?: MotionValue<T>
    ) {
        super(
            unresolvedKeyframes,
            onComplete,
            name,
            motionValue,
            motionValue?.owner as VisualElement,
            true
        )
    }

    readKeyframes() {
        const { unresolvedKeyframes, element, name } = this

        if (!element.current) return

        super.readKeyframes()

        /**
         * If any keyframe is a CSS variable, we need to find its value by sampling the element
         */
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
            const keyframe = unresolvedKeyframes[i]
            if (typeof keyframe === "string" && isCSSVariableToken(keyframe)) {
                const resolved = getVariableValue(keyframe, element.current)

                if (resolved !== undefined) {
                    unresolvedKeyframes[i] = resolved as T
                }
            }
        }
        console.log(unresolvedKeyframes)
        /**
         * Check to see if unit type has changed. If so schedule jobs that will
         * temporarily set styles to the destination keyframes.
         * Skip if we have more than two keyframes or this isn't a positional value.
         * TODO: We can throw if there are multiple keyframes and the value type changes.
         */
        if (!positionalKeys.has(name) || unresolvedKeyframes.length !== 2) {
            return this.resolveNoneKeyframes()
        }

        const [origin, target] = unresolvedKeyframes
        const originType = findDimensionValueType(origin)
        const targetType = findDimensionValueType(target)

        /**
         * Either we don't recognise these value types or we can animate between them.
         */
        if (originType === targetType) return

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

    resolveNoneKeyframes() {
        const { unresolvedKeyframes, name } = this

        const noneKeyframeIndexes: number[] = []
        for (let i = 0; i < unresolvedKeyframes.length; i++) {
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
    }

    measureKeyframe?: any
    unsetTransforms() {
        const { element, unresolvedKeyframes } = this

        if (!element.current) return

        // TODO: This is rendering the element, which includes
        // setting other transforms to their final states, messing up measurements
        // for other values
        this.removedTransforms = removeNonTranslationalTransform(element)

        this.measureKeyframe =
            unresolvedKeyframes[unresolvedKeyframes.length - 1]
    }

    renderUnsetTransforms() {
        if (this.removedTransforms?.length) {
            this.element.render()
        }
    }

    setFinalKeyframe() {
        const { element, name, measureKeyframe } = this
        if (!element.current || measureKeyframe === undefined) return

        element.getValue(name, measureKeyframe).jump(measureKeyframe, false)
    }

    measureInitialState() {
        const { element, unresolvedKeyframes, name } = this

        if (!element.current) return

        if (name === "height") {
            this.suspendedScrollY = window.pageYOffset
        }

        this.measuredOrigin = positionalValues[name](
            element.measureViewportBox(),
            window.getComputedStyle(element.current)
        )

        console.log("mesuring initial state for", name, this.measuredOrigin)

        unresolvedKeyframes[0] = this.measuredOrigin
    }

    renderEndStyles() {
        this.element.render()
    }

    measureEndState() {
        const { element, name, unresolvedKeyframes } = this

        if (!element.current) return

        console.log("before measure", unresolvedKeyframes, name)
        const value = element.getValue(name)
        value && value.jump(this.measuredOrigin, false)

        const finalKeyframeIndex = unresolvedKeyframes.length - 1
        const finalKeyframe = unresolvedKeyframes[finalKeyframeIndex]

        unresolvedKeyframes[finalKeyframeIndex] = positionalValues[name](
            element.measureViewportBox(),
            window.getComputedStyle(element.current)
        ) as any
        console.log("after measure", unresolvedKeyframes, name)
        if (finalKeyframe !== null) {
            this.finalKeyframe = finalKeyframe as T
        }

        if (name === "height" && this.suspendedScrollY !== undefined) {
            window.scrollTo(0, this.suspendedScrollY)
        }

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

        this.resolveNoneKeyframes()
    }
}
