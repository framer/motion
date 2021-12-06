import { isBrowser } from "../utils/is-browser"
import { useAnimationFrame } from "../utils/use-animation-frame"
import { useMotionValue } from "./use-motion-value"

export function useTime() {
    const time = useMotionValue(isBrowser ? performance.now() : 0)
    useAnimationFrame(({ timestamp }) => time.set(timestamp))
    return time
}
