import { useMemo, useRef, MutableRefObject } from "react"
import { MotionValue, Transformer } from "../motion-value"
import { interpolate } from "@popmotion/popcorn"

/**
 * `useTransform` is used to transform the output of one `MotionValue` into another.
 *
 * ## Import
 *
 * ```javascript
 * import { useTransform } from 'framer-motion'
 * ```
 *
 * ## Usage
 *
 * `useTransform` takes three arguments:
 *
 * - A `MotionValue` to transform the output of.
 * - An input range. This is a linear numerical sequence (e.g. [1, 2, 3] not [2, 3, 1])
 * - An output range. This is an array of the same length as the input range that can consist of:
 *  - Numbers
 *  - Unit values (ie) 'px', '%' etc
 *  - Colors (hex, rgba, hsla)
 *  - Strings consisting of multiple numbers and/or numbers (e.g. '0px 0px 0px #000')
 *
 * It returns a `MotionValue`. This can be passed to any component and used the same way as any other `MotionValue`.
 *
 * A simple example would be mapping one value to another on the same component:
 *
 * ```javascript
 * const Component = motion.div({
 *     visible: { x: 0 },
 *      hidden: { x: -100 }
 * })
 *
 * export default ({ isVisible }) => {
 *      const x = useMotionValue(0)
 *      const opacity = useTransform(x, [-100, 0], [0, 1])
 *
 *      return (
 *          <Component
 *              pose={isVisible ? 'visible' : 'hidden'}
 *              motionValues={{ x, opacity }}
 *          />
 *      )
 * };
 * ```
 *
 * @param {MotionValue} value - The `MotionValue` to transform
 * @param {number[]} from - A linear numerical sequence.
 * @param {string[] | number[]} to - A series of numbers, colors or
 */
export const useTransform = (value: MotionValue, from: number[], to: string[] | number[]) => {
    const transformedValue: MutableRefObject<null | MotionValue> = useRef(null)

    return useMemo(
        () => {
            if (transformedValue.current) transformedValue.current.destroy()

            const transformer = interpolate(from, to) as Transformer<any>
            transformedValue.current = value.addChild({ transformer })
            return transformedValue.current
        },
        [value, ...from, ...to]
    )
}
