import { MotionValue } from "../value"
import { useCustomValue } from "./use-custom-value"
import { interpolate } from "@popmotion/popcorn"

type TransformerOptions = { clamp: true }

type Transformer = (v: any) => any

const isTransformer = (v: number[] | Transformer): v is Transformer => {
    return typeof v === "function"
}

const noop = () => (v: any) => v

/**
 * Creates a new `MotionValue` that takes the output of another `MotionValue` and transforms it with a function
 *
 * @param value - `MotionValue`
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
 * Creates a new `MotionValue` that takes the output of another `MotionValue` and transforms between the `from` range to the `to` range.
 *
 * @remarks
 * Options:
 * - `clamp`: Default `true`. Clamps output to the provided array
 *
 * @param value - `MotionValue`
 * @param from - A linear series of numbers (either all increasing or decreasing)
 * @param to - A series of numbers, colors or strings. Must be the same length as `from`.
 * @param options - Options
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransformedValue(
    value: MotionValue<number>,
    from: number[],
    to: any[],
    options?: TransformerOptions
): MotionValue
export function useTransformedValue(
    value: MotionValue,
    transform: Transformer | number[],
    to?: any[],
    opts?: TransformerOptions
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
