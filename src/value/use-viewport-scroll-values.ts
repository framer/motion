import { motionValue, MotionValue } from "./"

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

        // Set progress
        const maxXOffset = document.body.clientWidth - window.innerWidth
        scrollXProgress.set(xOffset === 0 ? 0 : xOffset / maxXOffset)

        const maxYOffset = document.body.clientHeight - window.innerHeight
        scrollYProgress.set(yOffset === 0 ? 0 : yOffset / maxYOffset)
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
 * - `scrollX` — Horizontal scroll distance in pixels. <br/>
 * - `scrollY` — Vertical scroll distance in pixels. <br/>
 * - `scrollXProgress` — Horizontal scroll distance between `0` and `1`. <br/>
 * - `scrollYProgress` — Vertical scroll distance between `0` and `1`. <br/>
 *
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, useViewportScrollValues, useTransformedValue } from "framer"
 *
 * export function MyComponent() {
 *   const { scrollYProgress } = useViewportScrollValues()
 *   const scaleX = useTransformedValue(scrollYProgress, [0, 1], [0, 1])
 *
 *   return <Frame style={{ scaleX }} />
 * }
 * ```
 *
 * @public
 */
export function useViewportScrollValues() {
    if (!hasEventListener) {
        addScrollListener()
    }

    return viewportMotionValues
}
