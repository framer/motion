import { MotionValue } from "../value"
import { useCustomValue } from "./use-custom-value"
import { transform as interpolate, TransformOptions } from "../utils/transform"

type Transformer = (v: any) => any

const isTransformer = (v: number[] | Transformer): v is Transformer => {
    return typeof v === "function"
}

const noop = () => (v: any) => v

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` through a function.
 * Here, the `y` value will always be twice the `x` value.
 * ```jsx
 * import * as React from "react"
 * import {
 *   Frame,
 *   useMotionValue,
 *   useTransformedValue
 * } from "framer"
 *
 * export function MyComponent() {
 *   const x = useMotionValue(10)
 *   const y = useTransformedValue(x, value => value * 2)
 *
 *   return <Frame style={{ x, y }} />
 * }
 * ```
 *
 * @param value - The `MotionValue` to transform the output of.
 * @param transform - Function that accepts the output of `value` and returns a new value.
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransformedValue(
    value: MotionValue,
    transform: Transformer
): MotionValue
/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` by mapping it from one range of values into another.
 *
 * @remarks
 *
 * Given an input range of `[-200, -100, 100, 200]` and an output range of
 * `[0, 1, 1, 0]`, the returned `MotionValue` will:
 *
 * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`
 * - When provided a value between `-100` and `100`, will return `1`
 * - When provided a value between `100` and `200, will return a value between `1` and  `0`
 *
 * The input range must be a linear series of numbers. The output range
 * can be any value type supported by Framer Motion: numbers, colors, shadows, etc.
 *
 * ```jsx
 * export function MyComponent() {
 *   const x = useMotionValue(0)
 *   const xRange = [-200, -100, 100, 200]
 *   const opacityRange = [0, 1, 1, 0]
 *   const opacity = useTransformedValue(x, xRange, opacityRange)
 *
 *   return <Frame dragEnabled="x" style={{ opacity, x }} />
 * }
 * ```
 *
 * @param inputValue - `MotionValue`
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `from`.
 * @param options -
 *
 *  - clamp: boolean - Clamp values to within the given range. Defaults to `true`
 *
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransformedValue<T>(
    value: MotionValue<number>,
    from: number[],
    to: any[],
    options?: TransformOptions<T>
): MotionValue
export function useTransformedValue<T>(
    value: MotionValue,
    transform: Transformer | number[],
    to?: any[],
    options?: TransformOptions<T>
): MotionValue {
    let comparitor: any[] = [value]
    let transformer = noop

    if (isTransformer(transform)) {
        transformer = () => transform
    } else if (Array.isArray(to)) {
        const from = transform

        transformer = () => interpolate(from, to, options)

        comparitor = [value, from.join(","), to.join(",")]
    }

    return useCustomValue(value, transformer, comparitor)
}
