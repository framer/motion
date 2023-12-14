import { VisualElement } from "../render/VisualElement"
import { getVariableValue } from "../render/dom/utils/css-variables-conversion"
import { isCSSVariableToken } from "../render/dom/utils/is-css-variable"
import {
    isNumOrPxType,
    positionalKeys,
    positionalValues,
    removeNonTranslationalTransform,
} from "../render/dom/utils/unit-conversion"
import { findDimensionValueType } from "../render/dom/value-types/dimensions"
import { deregisterKeyframes, registerKeyframes } from "./scheduler"

export type UnresolvedKeyframes<T extends string | number> = Array<T | null>

export type ResolvedKeyframes<T extends string | number> = Array<T>

function forwardFillKeyframes<T extends string | number>(
    keyframes: UnresolvedKeyframes<T>
): ResolvedKeyframes<T> {
    // We know the first keyframe is not null, so we can coerce
    const resolvedKeyframes: ResolvedKeyframes<T> = [keyframes[0]!]

    for (let i = 1; i < keyframes.length; i++) {
        resolvedKeyframes[i] =
            keyframes[i] === null
                ? (keyframes[i - 1] as any)
                : (keyframes[i] as any)
    }

    return resolvedKeyframes
}

export class Keyframes<T extends string | number> {
    private element: VisualElement<HTMLElement>

    private name: string

    private keyframes: UnresolvedKeyframes<T>

    private resolvedKeyframes: ResolvedKeyframes<T>

    private resolvedFinalKeyframe?: T

    private removedTransforms?: [string, string | number][]

    private measuredOrigin?: string | number

    restoreScrollY?: number
    needsMeasurement = false

    resolve: (keyframes: ResolvedKeyframes<T>) => void
    ready = new Promise<ResolvedKeyframes<T>>(
        (resolve) => (this.resolve = resolve)
    )

    constructor(
        element: VisualElement<HTMLElement>,
        valueName: string,
        unresolvedKeyframes: UnresolvedKeyframes<T>
    ) {
        this.element = element
        this.name = valueName
        this.keyframes = unresolvedKeyframes

        registerKeyframes(this)
    }

    readKeyframes() {
        const { keyframes, element, name } = this

        if (!element.current) return

        /**
         * If any keyframe is a CSS variable, we need to find its value by sampling the element
         */
        for (let i = 0; i < keyframes.length; i++) {
            /**
             * If the first keyframe is null, we need to find its value by sampling the element
             */
            if (i === 0 && keyframes[0] === null) {
                keyframes[0] = element.readValue(name) as T
            }

            const keyframe = keyframes[i]
            if (isCSSVariableToken(keyframe)) {
                const resolved = getVariableValue(keyframe, element.current)
                if (resolved !== undefined) {
                    keyframes[i] = resolved as T
                }

                // If this variable is the final keyframe, set it as finalKeyframe
                if (i === keyframes.length - 1) {
                    this.resolvedFinalKeyframe = keyframe
                }
            }
        }

        this.resolvedKeyframes = forwardFillKeyframes(keyframes)

        /**
         * Check to see if unit type has changed. If so schedule jobs that will
         * temporarily set styles to the destination keyframes.
         * Skip if we have more than two keyframes or this isn't a positional value.
         * TODO: We can throw if there are multiple keyframes and the value type changes.
         */
        if (
            !positionalKeys.has(name) ||
            keyframes.length !== 2 ||
            isCSSVariableToken(
                this.resolvedKeyframes[this.resolvedKeyframes.length - 1]
            )
        ) {
            return
        }

        const [origin, target] = this.resolvedKeyframes
        const originType = findDimensionValueType(origin)
        const targetType = findDimensionValueType(target)

        if (!originType || !targetType || originType === targetType) return

        /**
         * If both values are numbers or pixels, we can animate between them by
         * converting them to numbers.
         */
        if (isNumOrPxType(originType) && isNumOrPxType(targetType)) {
            this.resolvedKeyframes = this.resolvedKeyframes.map((v) =>
                typeof v === "string" ? parseFloat(v) : v
            ) as any
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
            this.needsMeasurement = true
        }
    }

    unsetTransforms() {
        const { element, name, resolvedKeyframes } = this

        if (!element.current) return

        this.removedTransforms = removeNonTranslationalTransform(element)

        const finalKeyframe = resolvedKeyframes[resolvedKeyframes.length - 1]

        if (this.resolvedFinalKeyframe === undefined) {
            this.resolvedFinalKeyframe = finalKeyframe
        }

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

    renderTemporaryStyles() {
        this.element.render()
    }

    readTemporaryStyles() {
        const { element, name, resolvedKeyframes } = this

        if (!element.current) return

        const value = element.getValue(name)
        value && value.jump(this.measuredOrigin)

        resolvedKeyframes[resolvedKeyframes.length - 1] = positionalValues[
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

    cancel() {
        deregisterKeyframes(this)
    }
}
