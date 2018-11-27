import { useEffect } from "react"
import { useMotionValue } from "../motion-value/use-motion-value"

const useViewportScroll = () => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    useEffect(() => {
        const onScroll = () => {
            x.set(window.pageXOffset)
            y.set(window.pageYOffset)
        }

        window.addEventListener("scroll", onScroll, { passive: true })

        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return { x, y }
}

export { useViewportScroll }
