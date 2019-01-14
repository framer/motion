import { useMotionValue } from "../motion-value/use-motion-value"
import { useEvent } from "../events/use-event"

/**
 * `useViewportScroll` provides `MotionValue`s that update when the viewport scrolls.
 *
 * This makes it possible to transform viewport scroll into other values.
 *
 * For instance, highlighting different table of contents items to correspond with page scroll.
 */
const useViewportScroll = () => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const onScroll = () => {
        x.set(window.pageXOffset)
        y.set(window.pageYOffset)
    }

    useEvent("scroll", window, onScroll, { passive: true })

    return { x, y }
}

export { useViewportScroll }
