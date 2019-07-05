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
 * Provides `MotionValue`s that update when the viewport scrolls:
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
 * @internalremarks
 * This isn't technically a hook yet, but in the future it might be nice
 * to accept refs to elements and add scroll listeners to those, which
 * may involve the use of lifecycle.
 *
 * @public
 */
export function useViewportScroll() {
    if (!hasEventListener) {
        addScrollListener()
    }

    return viewportMotionValues
}
