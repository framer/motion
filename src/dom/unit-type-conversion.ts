import { Target, TargetWithKeyframes } from "../types"
import { MotionValuesMap } from "../motion"
import { MotionValue } from "../value"
import { transformOrder } from "../dom/VisualElement/utils/transform"
import { detectDimensionValueType } from "./value-types"
import { isKeyframesTarget } from "../animation/utils/is-keyframes-target"
import { invariant } from "hey-listen"
import { number, px, ValueType } from "style-value-types"
import { VisualElement } from "../dom/VisualElement"

const positionalKeys = new Set([
    "width",
    "height",
    "top",
    "left",
    "right",
    "bottom",
    "x",
    "y",
])
const isPositionalKey = (key: string) => positionalKeys.has(key)
const hasPositionalKey = (target: TargetWithKeyframes) => {
    return Object.keys(target).some(isPositionalKey)
}

const setAndResetVelocity = (value: MotionValue, to: string | number) => {
    // Looks odd but setting it twice doesn't render, it'll just
    // set both prev and current to the latest value
    value.set(to, false)
    value.set(to)
}

const isNumOrPxType = (v?: ValueType): v is ValueType =>
    v === number || v === px

export type BoundingBox = { [key in BoundingBoxDimension]: number }

export enum BoundingBoxDimension {
    width = "width",
    height = "height",
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
}

type GetActualMeasurementInPixels = (
    bbox: ClientRect | DOMRect,
    computedStyle: Partial<CSSStyleDeclaration>
) => number

const getPosFromMatrix = (matrix: string, pos: number) =>
    parseFloat(matrix.split(", ")[pos])

const getTranslateFromMatrix = (
    pos2: number,
    pos3: number
): GetActualMeasurementInPixels => (_bbox, { transform }) => {
    if (transform === "none" || !transform) return 0

    const matrix3d = transform.match(/^matrix3d\((.+)\)$/)

    if (matrix3d) {
        return getPosFromMatrix(matrix3d[1], pos3)
    } else {
        const matrix = transform.match(/^matrix\((.+)\)$/) as string[]
        return getPosFromMatrix(matrix[1], pos2)
    }
}

const translateKeys = new Set(["x", "y", "z"])
const nonTranslationalTransformKeys = transformOrder.filter(
    key => !translateKeys.has(key)
)

type RemovedTransforms = [string, string | number][]
function removeNonTranslationalTransform(
    values: MotionValuesMap,
    visualElement: VisualElement
) {
    const removedTransforms: RemovedTransforms = []

    nonTranslationalTransformKeys.forEach(key => {
        const value: MotionValue<string | number> | undefined = values.get(key)
        if (value !== undefined) {
            removedTransforms.push([key, value.get()])
            value.set(key.startsWith("scale") ? 1 : 0)
        }
    })

    // Apply changes to element before measurement
    if (removedTransforms.length) visualElement.render()

    return removedTransforms
}

const positionalValues: { [key: string]: GetActualMeasurementInPixels } = {
    // Dimensions
    width: ({ width }) => width,
    height: ({ height }) => height,

    top: (_bbox, { top }) => parseFloat(top as string),
    left: (_bbox, { left }) => parseFloat(left as string),
    bottom: ({ height }, { top }) => parseFloat(top as string) + height,
    right: ({ width }, { left }) => parseFloat(left as string) + width,

    // Transform
    x: getTranslateFromMatrix(4, 13),
    y: getTranslateFromMatrix(5, 14),
}

const convertChangedValueTypes = (
    target: TargetWithKeyframes,
    values: MotionValuesMap,
    visualElement: VisualElement,
    changedKeys: string[]
) => {
    const originBbox = visualElement.getBoundingBox()
    const elementComputedStyle = visualElement.getComputedStyle()
    const {
        display,
        top,
        left,
        bottom,
        right,
        transform,
    } = elementComputedStyle
    const originComputedStyle = { top, left, bottom, right, transform }

    // If the element is currently set to display: "none", make it visible before
    // measuring the target bounding box
    if (display === "none") {
        visualElement.setStyle(
            "display",
            (target.display as string | number) || "block"
        )
    }

    // Apply the latest values (as set in checkAndConvertChangedValueTypes)
    visualElement.render()

    const targetBbox = visualElement.getBoundingBox()

    changedKeys.forEach(key => {
        // Restore styles to their **calculated computed style**, not their actual
        // originally set style. This allows us to animate between equivalent pixel units.
        const value = values.get(key) as MotionValue
        setAndResetVelocity(
            value,
            positionalValues[key](originBbox, originComputedStyle)
        )
        target[key] = positionalValues[key](targetBbox, elementComputedStyle)
    })

    return target
}

const checkAndConvertChangedValueTypes = (
    values: MotionValuesMap,
    visualElement: VisualElement,
    target: TargetWithKeyframes,
    transitionEnd: Target = {}
): { target: TargetWithKeyframes; transitionEnd: Target } => {
    target = { ...target }
    transitionEnd = { ...transitionEnd }

    const targetPositionalKeys = Object.keys(target).filter(isPositionalKey)

    // We want to remove any transform values that could affect the element's bounding box before
    // it's measured. We'll reapply these later.
    let removedTransformValues: RemovedTransforms = []
    let hasAttemptedToRemoveTransformValues = false

    const changedValueTypeKeys: string[] = targetPositionalKeys.reduce(
        (acc, key) => {
            const value = values.get(key) as MotionValue<number | string>
            if (!value) return acc

            const from = value.get()
            const to = target[key]
            const fromType = detectDimensionValueType(from)
            let toType

            // TODO: The current implementation of this basically throws an error
            // if you try and do value conversion via keyframes. There's probably
            // a way of doing this but the performance implications would need greater scrutiny,
            // as it'd be doing multiple resize-remeasure operations.
            if (isKeyframesTarget(to)) {
                const numKeyframes = to.length

                for (let i = to[0] === null ? 1 : 0; i < numKeyframes; i++) {
                    if (!toType) {
                        toType = detectDimensionValueType(to[i])

                        invariant(
                            toType === fromType ||
                                (isNumOrPxType(fromType) &&
                                    isNumOrPxType(toType)),
                            "Keyframes must be of the same dimension as the current value"
                        )
                    } else {
                        invariant(
                            detectDimensionValueType(to[i]) === toType,
                            "All keyframes must be of the same type"
                        )
                    }
                }
            } else {
                toType = detectDimensionValueType(to)
            }

            if (fromType !== toType) {
                // If they're both just number or px, convert them both to numbers rather than
                // relying on resize/remeasure to convert (which is wasteful in this situation)
                if (isNumOrPxType(fromType) && isNumOrPxType(toType)) {
                    const current = value.get()
                    if (typeof current === "string") {
                        value.set(parseFloat(current))
                    }
                    if (typeof to === "string") {
                        target[key] = parseFloat(to)
                    } else if (Array.isArray(to) && toType === px) {
                        target[key] = to.map(parseFloat)
                    }
                } else {
                    // If we're going to do value conversion via DOM measurements, we first
                    // need to remove non-positional transform values that could affect the bbox measurements.
                    if (!hasAttemptedToRemoveTransformValues) {
                        removedTransformValues = removeNonTranslationalTransform(
                            values,
                            visualElement
                        )
                        hasAttemptedToRemoveTransformValues = true
                    }

                    acc.push(key)
                    transitionEnd[key] =
                        transitionEnd[key] !== undefined
                            ? transitionEnd[key]
                            : target[key]
                    setAndResetVelocity(value, to)
                }
            }

            return acc
        },
        [] as string[]
    )

    if (changedValueTypeKeys.length) {
        const convertedTarget = convertChangedValueTypes(
            target,
            values,
            visualElement,
            changedValueTypeKeys
        )

        // If we removed transform values, reapply them before the next render
        if (removedTransformValues.length) {
            removedTransformValues.forEach(([key, value]) => {
                values.get(key)!.set(value)
            })
        }

        // Reapply original values
        visualElement.render()

        return { target: convertedTarget, transitionEnd }
    } else {
        return { target, transitionEnd }
    }
}

/**
 * Convert value types for x/y/width/height/top/left/bottom/right
 *
 * Allows animation between `'auto'` -> `'100%'` or `0` -> `'calc(50% - 10vw)'`
 *
 * @param values
 * @param visualElement
 * @param target
 * @param transitionEnd
 * @internal
 */
export function unitConversion(
    values: MotionValuesMap,
    visualElement: VisualElement,
    target: TargetWithKeyframes,
    transitionEnd?: Target
): { target: TargetWithKeyframes; transitionEnd?: Target } {
    return hasPositionalKey(target)
        ? checkAndConvertChangedValueTypes(
              values,
              visualElement,
              target,
              transitionEnd
          )
        : { target, transitionEnd }
}
