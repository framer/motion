import { Target, TargetWithKeyframes } from "../../../types"
import { isKeyframesTarget } from "../../../animation/utils/is-keyframes-target"
import { invariant } from "../../../utils/errors"
import { MotionValue } from "../../../value"
import { transformPropOrder } from "../../html/utils/transform"
import { ResolvedValues } from "../../types"
import { findDimensionValueType } from "../value-types/dimensions"
import { Box } from "../../../projection/geometry/types"
import { isBrowser } from "../../../utils/is-browser"
import type { VisualElement } from "../../VisualElement"
import { ValueType } from "../../../value/types/types"
import { number } from "../../../value/types/numbers"
import { px } from "../../../value/types/numbers/units"

const positionalKeys = new Set([
    "width",
    "height",
    "top",
    "left",
    "right",
    "bottom",
    "x",
    "y",
    "translateX",
    "translateY",
])
const isPositionalKey = (key: string) => positionalKeys.has(key)
const hasPositionalKey = (target: TargetWithKeyframes) => {
    return Object.keys(target).some(isPositionalKey)
}

const isNumOrPxType = (v?: ValueType): v is ValueType =>
    v === number || v === px

type GetActualMeasurementInPixels = (
    bbox: Box,
    computedStyle: Partial<CSSStyleDeclaration>
) => number

const getPosFromMatrix = (matrix: string, pos: number) =>
    parseFloat(matrix.split(", ")[pos])

const getTranslateFromMatrix =
    (pos2: number, pos3: number): GetActualMeasurementInPixels =>
    (_bbox, { transform }) => {
        if (transform === "none" || !transform) return 0

        const matrix3d = transform.match(/^matrix3d\((.+)\)$/)

        if (matrix3d) {
            return getPosFromMatrix(matrix3d[1], pos3)
        } else {
            const matrix = transform.match(/^matrix\((.+)\)$/) as string[]
            if (matrix) {
                return getPosFromMatrix(matrix[1], pos2)
            } else {
                return 0
            }
        }
    }

const transformKeys = new Set(["x", "y", "z"])
const nonTranslationalTransformKeys = transformPropOrder.filter(
    (key) => !transformKeys.has(key)
)

type RemovedTransforms = [string, string | number][]
function removeNonTranslationalTransform(visualElement: VisualElement) {
    const removedTransforms: RemovedTransforms = []

    nonTranslationalTransformKeys.forEach((key) => {
        const value: MotionValue<string | number> | undefined =
            visualElement.getValue(key)
        if (value !== undefined) {
            removedTransforms.push([key, value.get()])
            value.set(key.startsWith("scale") ? 1 : 0)
        }
    })

    // Apply changes to element before measurement
    if (removedTransforms.length) visualElement.render()

    return removedTransforms
}

export const positionalValues: { [key: string]: GetActualMeasurementInPixels } =
    {
        // Dimensions
        width: ({ x }, { paddingLeft = "0", paddingRight = "0" }) =>
            x.max - x.min - parseFloat(paddingLeft) - parseFloat(paddingRight),
        height: ({ y }, { paddingTop = "0", paddingBottom = "0" }) =>
            y.max - y.min - parseFloat(paddingTop) - parseFloat(paddingBottom),

        top: (_bbox, { top }) => parseFloat(top as string),
        left: (_bbox, { left }) => parseFloat(left as string),
        bottom: ({ y }, { top }) => parseFloat(top as string) + (y.max - y.min),
        right: ({ x }, { left }) =>
            parseFloat(left as string) + (x.max - x.min),

        // Transform
        x: getTranslateFromMatrix(4, 13),
        y: getTranslateFromMatrix(5, 14),
    }

const convertChangedValueTypes = (
    target: TargetWithKeyframes,
    visualElement: VisualElement<HTMLElement | SVGElement>,
    changedKeys: string[]
) => {
    const originBbox = visualElement.measureViewportBox()
    const element = visualElement.current
    const elementComputedStyle = getComputedStyle(element!)
    const { display } = elementComputedStyle
    const origin: ResolvedValues = {}

    // If the element is currently set to display: "none", make it visible before
    // measuring the target bounding box
    if (display === "none") {
        visualElement.setStaticValue(
            "display",
            (target.display as string) || "block"
        )
    }

    /**
     * Record origins before we render and update styles
     */
    changedKeys.forEach((key) => {
        origin[key] = positionalValues[key](originBbox, elementComputedStyle)
    })

    // Apply the latest values (as set in checkAndConvertChangedValueTypes)
    visualElement.render()

    const targetBbox = visualElement.measureViewportBox()

    changedKeys.forEach((key) => {
        // Restore styles to their **calculated computed style**, not their actual
        // originally set style. This allows us to animate between equivalent pixel units.
        const value = visualElement.getValue(key)

        value && value.jump(origin[key])
        target[key] = positionalValues[key](targetBbox, elementComputedStyle)
    })

    return target
}

const checkAndConvertChangedValueTypes = (
    visualElement: VisualElement<HTMLElement | SVGElement>,
    target: TargetWithKeyframes,
    origin: Target = {},
    transitionEnd: Target = {}
): { target: TargetWithKeyframes; transitionEnd: Target } => {
    target = { ...target }
    transitionEnd = { ...transitionEnd }

    const targetPositionalKeys = Object.keys(target).filter(isPositionalKey)

    // We want to remove any transform values that could affect the element's bounding box before
    // it's measured. We'll reapply these later.
    let removedTransformValues: RemovedTransforms = []
    let hasAttemptedToRemoveTransformValues = false

    const changedValueTypeKeys: string[] = []

    targetPositionalKeys.forEach((key) => {
        const value = visualElement.getValue(key) as MotionValue<
            number | string
        >
        if (!visualElement.hasValue(key)) return

        let from = origin[key]
        let fromType = findDimensionValueType(from)
        const to = target[key]
        let toType

        // TODO: The current implementation of this basically throws an error
        // if you try and do value conversion via keyframes. There's probably
        // a way of doing this but the performance implications would need greater scrutiny,
        // as it'd be doing multiple resize-remeasure operations.
        if (isKeyframesTarget(to)) {
            const numKeyframes = to.length
            const fromIndex = to[0] === null ? 1 : 0
            from = to[fromIndex]
            fromType = findDimensionValueType(from)

            for (let i = fromIndex; i < numKeyframes; i++) {
                /**
                 * Don't allow wildcard keyframes to be used to detect
                 * a difference in value types.
                 */
                if (to[i] === null) break

                if (!toType) {
                    toType = findDimensionValueType(to[i])

                    invariant(
                        toType === fromType ||
                            (isNumOrPxType(fromType) && isNumOrPxType(toType)),
                        "Keyframes must be of the same dimension as the current value"
                    )
                } else {
                    invariant(
                        findDimensionValueType(to[i]) === toType,
                        "All keyframes must be of the same type"
                    )
                }
            }
        } else {
            toType = findDimensionValueType(to)
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
            } else if (
                fromType?.transform &&
                toType?.transform &&
                (from === 0 || to === 0)
            ) {
                // If one or the other value is 0, it's safe to coerce it to the
                // type of the other without measurement
                if (from === 0) {
                    value.set((toType as any).transform(from))
                } else {
                    target[key] = (fromType as any).transform(to)
                }
            } else {
                // If we're going to do value conversion via DOM measurements, we first
                // need to remove non-positional transform values that could affect the bbox measurements.
                if (!hasAttemptedToRemoveTransformValues) {
                    removedTransformValues =
                        removeNonTranslationalTransform(visualElement)
                    hasAttemptedToRemoveTransformValues = true
                }

                changedValueTypeKeys.push(key)
                transitionEnd[key] =
                    transitionEnd[key] !== undefined
                        ? transitionEnd[key]
                        : target[key]

                value.jump(to)
            }
        }
    })

    if (changedValueTypeKeys.length) {
        const scrollY =
            changedValueTypeKeys.indexOf("height") >= 0
                ? window.pageYOffset
                : null

        const convertedTarget = convertChangedValueTypes(
            target,
            visualElement,
            changedValueTypeKeys
        )

        // If we removed transform values, reapply them before the next render
        if (removedTransformValues.length) {
            removedTransformValues.forEach(([key, value]) => {
                visualElement.getValue(key)!.set(value)
            })
        }

        // Reapply original values
        visualElement.render()

        // Restore scroll position
        if (isBrowser && scrollY !== null) {
            window.scrollTo({ top: scrollY })
        }

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
 * @internal
 */
export function unitConversion(
    visualElement: VisualElement<HTMLElement | SVGElement>,
    target: TargetWithKeyframes,
    origin?: Target,
    transitionEnd?: Target
): { target: TargetWithKeyframes; transitionEnd?: Target } {
    return hasPositionalKey(target)
        ? checkAndConvertChangedValueTypes(
              visualElement,
              target,
              origin,
              transitionEnd
          )
        : { target, transitionEnd }
}
