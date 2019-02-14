import { MotionValue } from "../value"
import { useCustomValue } from "./use-custom-value"
import { interpolate } from "@popmotion/popcorn"

type MapOptions = { clamp: true }

type Transformer = (v: any) => any

const isTransformer = (v: number[] | Transformer): v is Transformer => {
    return typeof v === "function"
}

const noop = () => (v: any) => v

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` through a function.
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
 * @param value - `MotionValue`
 * @param fromRange - A linear series of numbers (either all increasing or decreasing)
 * @param toRange - A series of numbers, colors or strings. Must be the same length as `from`.
 * @param options -
 *
 *  - clamp: boolean - Clamp values to within the given range. Defaults to `true`
 *
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransformedValue(
    value: MotionValue<number>,
    from: number[],
    to: any[],
    options?: MapOptions
): MotionValue
export function useTransformedValue(
    value: MotionValue,
    transform: Transformer | number[],
    to?: any[],
    opts?: MapOptions
): MotionValue {
    let comparitor: any[] = [value]
    let transformer = noop

    if (isTransformer(transform)) {
        transformer = () => transform
    } else if (Array.isArray(to)) {
        const from = transform
        transformer = () => interpolate(from, to, opts)
        comparitor = [value, from.join(","), to.join(",")]
    }

    return useCustomValue(value, transformer, comparitor)
}
