import { interpolate } from "@popmotion/popcorn"
import { Easing } from "@popmotion/easing"
import { CustomValueType } from "../types"

/**
 * @public
 */
export interface TransformOptions<T> {
    /**
     * Clamp values to within the given range. Defaults to `true`
     *
     * @public
     */
    clamp?: boolean

    /**
     * Easing functions to use on the interpolations between each value in the input and output ranges.
     *
     * If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition **between** each.
     *
     * @public
     */
    ease?: Easing | Easing[]

    /**
     * @internal
     */
    mixer?: (from: T, to: T) => (v: number) => any
}

const isCustomValueType = (v: any): v is CustomValueType => {
    return typeof v === "object" && v.mix
}

const getMixer = (v: any) => (isCustomValueType(v) ? v.mix : undefined)

/**
 * Create a function that transforms numbers into other values by mapping them from an input range to an output range.
 *
 * @remarks
 *
 * Given an input range of `[-200, -100, 100, 200]` and an output range of
 * `[0, 1, 1, 0]`, the returned function will:
 *
 * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`
 * - When provided a value between `-100` and `100`, will return `1`
 * - When provided a value between `100` and `200`, will return a value between `1` and  `0`
 *
 * The input range must be a linear series of numbers. The output range
 * can be any value type supported by Framer Motion: numbers, colors, shadows, etc.
 *
 * Every value in the output range must be of the same type and in the same format.
 *
 * ```jsx
 * const xRange = [-200, -100, 100, 200]
 * const opacityRange = [0, 1, 1, 0]
 * const transformXToOpacity = transform(xRange, opacityRange)
 *
 * transformXToOpacity(-150) // Returns 0.5
 * ```
 *
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
 * @param options -
 *
 *  - clamp: boolean - Clamp values to within the given range. Defaults to `true`
 *
 * @public
 */
export function transform<T>(
    inputRange: number[],
    outputRange: T[],
    options?: TransformOptions<T>
) {
    return interpolate(inputRange, outputRange, {
        mixer: getMixer(outputRange[0]),
        ...options,
    })
}
