import { useContext } from "react"
import {
    createScrollMotionValues,
    createScrollUpdater,
    ScrollMotionValues,
} from "./utils"
import { addDomEvent } from "../../events/use-dom-event"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { MotionConfigContext } from "../../context/MotionConfigContext"

let viewportScrollValues: ScrollMotionValues
let hasListeners = false

function addEventListeners({
    windowContext,
    documentContext,
}: {
    windowContext: typeof window
    documentContext: typeof document
}) {
    hasListeners = true
    if (typeof windowContext === "undefined") return

    const updateScrollValues = createScrollUpdater(
        viewportScrollValues,
        () => ({
            xOffset: windowContext.pageXOffset,
            yOffset: windowContext.pageYOffset,
            xMaxOffset:
                documentContext.body.clientWidth - windowContext.innerWidth,
            yMaxOffset:
                documentContext.body.clientHeight - windowContext.innerHeight,
        })
    )

    addDomEvent(windowContext, "scroll", updateScrollValues, { passive: true })
    addDomEvent(windowContext, "resize", updateScrollValues)
}

/**
 * Returns MotionValues that update when the viewport scrolls:
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll progress between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll progress between `0` and `1`.
 *
 * **Warning:** Setting `body` or `html` to `height: 100%` or similar will break the `Progress`
 * values as this breaks the browser's capability to accurately measure the page length.
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
    const { documentContext, windowContext } = useContext(MotionConfigContext)
    /**
     * Lazy-initialise the viewport scroll values
     */
    if (!viewportScrollValues) {
        viewportScrollValues = createScrollMotionValues()
    }

    useIsomorphicLayoutEffect(() => {
        !hasListeners && addEventListeners({ documentContext, windowContext })
    }, [])

    return viewportScrollValues
}
