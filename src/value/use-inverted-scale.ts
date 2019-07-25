import { useContext } from "react"
import { MotionContext } from "../motion/context/MotionContext"
import { useTransform } from "../value/use-transform"

const invertScale = (scale: number) => 1 / scale

/**
 * @beta
 */
export const useInvertedScale = () => {
    const { values } = useContext(MotionContext)
    const scaleX = useTransform(values!.get("scaleX", 1), invertScale)
    const scaleY = useTransform(values!.get("scaleY", 1), invertScale)
    return { scaleX, scaleY }
}
