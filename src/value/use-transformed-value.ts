import { useMemo, useRef, MutableRefObject } from "react"
import { MotionValue, Transformer } from "./"
import { interpolate } from "@popmotion/popcorn"

/**
 * @param {MotionValue} value - The `MotionValue` to transform
 * @param {number[]} from - A linear numerical sequence.
 * @param {string[] | number[]} to - A series of numbers, colors or
 *
 * TODO: Maybe a second implementation, or value
 *
 * Arbitrary functions
 * useTransformedValue(x, (v) => `${x}px`)
 *
 * Multiple values
 * useTransformedValue({ x, y }, (v) => [v.x, v.y])
 */
export const useTransformedValue = <To extends string[] | number[]>(
    value: MotionValue<number>,
    from: number[],
    to: To
): MotionValue<typeof to[number]> => {
    const transformedValue: MutableRefObject<null | MotionValue<
        To[number]
    >> = useRef(null)
    return useMemo(
        () => {
            if (transformedValue.current) transformedValue.current.destroy()

            // This cast is needed because interpolate does not base it's return type on the to type (yet)
            const transformer = interpolate(from, to) as Transformer<number>
            transformedValue.current = value.addChild({ transformer })
            return transformedValue.current
        },
        [value, from.join(","), to.join(",")]
    )
}
