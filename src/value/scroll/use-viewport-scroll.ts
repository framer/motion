import {
    createScrollMotionValues,
    createScrollUpdater,
    ScrollMotionValues,
} from "./utils"
import { addDomEvent } from "../../events/use-dom-event"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"

let viewportScrollValues: ScrollMotionValues

function getViewportScrollOffsets() {
    return {
        xOffset: window.pageXOffset,
        yOffset: window.pageYOffset,
        xMaxOffset: document.body.clientWidth - window.innerWidth,
        yMaxOffset: document.body.clientHeight - window.innerHeight,
    }
}

let hasListeners = false

function addEventListeners() {
    hasListeners = true
    if (typeof window === "undefined") return

    const updateScrollValues = createScrollUpdater(
        viewportScrollValues,
        getViewportScrollOffsets
    )

    addDomEvent(window, "scroll", updateScrollValues, { passive: true })
    addDomEvent(window, "resize", updateScrollValues)
}

/**
 * Returns MotionValues that update when the viewport scrolls:
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll progress between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll progress between `0` and `1`.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import {
 *   Frame,
 *   useViewportScroll,
 *   useTransform
 * } from "framer"
 *
 * export function MyComponent() {
 *   const { scrollYProgress } = useViewportScroll()
 *   return <Frame scaleX={scrollYProgress} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const { scrollYProgress } = useViewportScroll()
 *   return <motion.div style={{ scaleX: scrollYProgress }} />
 * }
 * ```
 *
 * @public
 */
export function useViewportScroll(): ScrollMotionValues {
    /**
     * Lazy-initialise the viewport scroll values
     */
    if (!viewportScrollValues) {
        viewportScrollValues = createScrollMotionValues()
    }

    useIsomorphicLayoutEffect(() => {
        !hasListeners && addEventListeners()
    }, [])

    return viewportScrollValues
}
