import { RefObject } from "react"
import { Target } from "../types"
import { MotionValuesMap } from "../motion"
import { MotionValue } from "../value"
import styler from "stylefire"
import { getValueType } from "./value-types"

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
const hasPositionalKey = (target: Target) =>
    Object.keys(target).some(isPositionalKey)

const setAndResetVelocity = (value: MotionValue, to: string | number) => {
    // Looks odd but setting it twice doesn't render, it'll just
    // set both prev and current to the latest value
    value.set(to, false)
    value.set(to)
}

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
    pose: Target,
    values: MotionValuesMap,
    ref: RefObject<Element>,
    changedKeys: string[]
) => {
    const element = ref.current as Element
    const elementStyler = styler(element)
    const originBbox = element.getBoundingClientRect()
    const elementComputedStyle = getComputedStyle(element)
    const { top, left, bottom, right, transform } = elementComputedStyle
    const originComputedStyle = { top, left, bottom, right, transform }

    // Apply the latest values (as set in checkAndConvertChangedValueTypes)
    elementStyler.render()

    const targetBbox = element.getBoundingClientRect()

    changedKeys.forEach(key => {
        // Restore styles to their **calculated computed style**, not their actual
        // originally set style. This allows us to animate between equivalent pixel units.
        const value = values.get(key) as MotionValue
        setAndResetVelocity(
            value,
            positionalValues[key](originBbox, originComputedStyle)
        )
        pose[key] = positionalValues[key](targetBbox, elementComputedStyle)
    })

    // Reapply original values
    elementStyler.render()

    return pose
}

const checkAndConvertChangedValueTypes = (
    values: MotionValuesMap,
    ref: RefObject<Element>,
    target: Target,
    transitionEnd: Target = {}
): { target: Target; transitionEnd: Target } => {
    transitionEnd = { ...transitionEnd }
    const posePositionalKeys = Object.keys(target).filter(isPositionalKey)

    const changedValueTypeKeys: string[] = posePositionalKeys.reduce(
        (acc, key) => {
            const value = values.get(key) as MotionValue
            const from = value!.get()
            const to = target[key]
            const fromType = getValueType(from)
            const toType = getValueType(to)

            if (fromType !== toType) {
                acc.push(key)
                transitionEnd[key] =
                    transitionEnd[key] !== undefined
                        ? transitionEnd[key]
                        : target[key]
                setAndResetVelocity(value, to)
            }

            return acc
        },
        [] as string[]
    )

    return changedValueTypeKeys.length
        ? {
              target: convertChangedValueTypes(
                  target,
                  values,
                  ref,
                  changedValueTypeKeys
              ),
              transitionEnd,
          }
        : { target, transitionEnd }
}

/**
 * Convert value types for x/y/width/height/top/left/bottom/right
 *
 * Allows animation between `'auto'` -> `'100%'` or `0` -> `'calc(50% - 10vw)'`
 *
 * @param values
 * @param ref
 * @param target
 * @param transitionEnd
 * @internal
 */
export function unitConversion(
    values: MotionValuesMap,
    ref: RefObject<Element>,
    target: Target,
    transitionEnd?: Target
): { target: Target; transitionEnd?: Target } {
    return hasPositionalKey(target)
        ? checkAndConvertChangedValueTypes(values, ref, target, transitionEnd)
        : { target, transitionEnd }
}
