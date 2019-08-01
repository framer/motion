import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"
import { useTransform } from "../value/use-transform"
import { MotionValue } from "./"
import { invariant } from "hey-listen"

interface ScaleMotionValues {
    scaleX: MotionValue<number>
    scaleY: MotionValue<number>
}

// Keep things reasonable and avoid scale: Infinity. In practise we might need
// to add another value, opacity, that could interpolate scaleX/Y [0,0.01] => [0,1]
// to simply hide content at unreasonable scales.
const maxScale = 100000
const invertScale = (scale: number) => (scale > 0.001 ? 1 / scale : maxScale)

/**
 * Returns a `MotionValue` each for `scaleX` and `scaleY` that update with the inverse
 * of their respective parent scales.
 *
 * This is useful for undoing the distortion of content when scaling a parent component.
 *
 * By default, `useInvertedScale` will automatically fetch `scaleX` and `scaleY` from the nearest parent.
 * By passing other `MotionValue`s in as `useInvertedScale({ scaleX, scaleY })`, it will invert the output
 * of those instead.
 *
 * @motion
 *
 * ```jsx
 * const MyComponent = () => {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <motion.div style={{ scaleX, scaleY }} />
 * }
 * ```
 *
 * @library
 *
 * ```jsx
 * function MyComponent() {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <Frame scaleX={scaleX} scaleY={scaleY} />
 * }
 * ```
 *
 * @beta
 */
export const useInvertedScale = ({
    scaleX: parentScaleX,
    scaleY: parentScaleY,
}: Partial<ScaleMotionValues> = {}): ScaleMotionValues => {
    const { values } = useContext(MotionContext)

    invariant(
        !!values,
        "useInvertedScale must be used within a child of another motion component."
    )

    const scaleX = useTransform(
        parentScaleX || values!.get("scaleX", 1),
        invertScale
    )
    const scaleY = useTransform(
        parentScaleY || values!.get("scaleY", 1),
        invertScale
    )

    return { scaleX, scaleY }
}
