import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"
import { useTransform } from "../value/use-transform"

const maxScale = 10000
const invertScale = (scale: number) => (scale > 0.01 ? 1 / scale : maxScale)

/**
 * Returns a `MotionValue` each for `scaleX` and `scaleY` that update with the inverse
 * of their respective parent scales.
 *
 * This is useful for undoing the distortion of content when scaling a parent component.
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
 * @beta
 */
export const useInvertedScale = () => {
    const { values } = useContext(MotionContext)
    const scaleX = useTransform(values!.get("scaleX", 1), invertScale)
    const scaleY = useTransform(values!.get("scaleY", 1), invertScale)
    return { scaleX, scaleY }
}
