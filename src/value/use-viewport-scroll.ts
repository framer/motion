import { motionValue, MotionValue } from "."

export interface ScrollMotionValues {
    scrollX: MotionValue<number>
    scrollY: MotionValue<number>
    scrollXProgress: MotionValue<number>
    scrollYProgress: MotionValue<number>
}

const scrollX = motionValue(0)
const scrollY = motionValue(0)
const scrollXProgress = motionValue(0)
const scrollYProgress = motionValue(0)

const setProgress = (offset: number, maxOffset: number, value: MotionValue) => {
    value.set(!maxOffset || !offset ? 0 : offset / maxOffset)
}

let hasEventListener = false
const addScrollListener = () => {
    hasEventListener = true

    if (typeof window === "undefined") return

    const updateScrollValues = () => {
        const xOffset = window.pageXOffset
        const yOffset = window.pageYOffset

        // Set absolute positions
        scrollX.set(xOffset)
        scrollY.set(yOffset)

        // Set 0-1 progress
        setProgress(
            xOffset,
            document.body.clientWidth - window.innerWidth,
            scrollXProgress
        )
        setProgress(
            yOffset,
            document.body.clientHeight - window.innerHeight,
            scrollYProgress
        )
    }

    updateScrollValues()

    window.addEventListener("resize", updateScrollValues)
    window.addEventListener("scroll", updateScrollValues, { passive: true })
}

const viewportMotionValues: ScrollMotionValues = {
    scrollX,
    scrollY,
    scrollXProgress,
    scrollYProgress,
}

/**
 * Provides a `MotionValue` that updates when the viewport scrolls.
 * Returns the following four values.
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll distance between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll distance between `0` and `1`.
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
 * import * as React from "react"
 * import {
 *   motion,
 *   useViewportScroll,
 *   useTransform
 * } from "framer-motion"
 *
 * export const MyComponent = () => {
 *   const { scrollYProgress } = useViewportScroll()
 *   return <motion.div style={{ scaleX: scrollYProgress }} />
 * }
 * ```
 *
 * @public
 */
export function useViewportScroll() {
    if (!hasEventListener) {
        addScrollListener()
    }

    return viewportMotionValues
}
