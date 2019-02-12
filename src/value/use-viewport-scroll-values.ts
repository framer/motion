import { motionValue } from "./"

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

const viewportMotionValues = {
    scrollX,
    scrollY,
    scrollXProgress,
    scrollYProgress,
}

/**
 * Provides `MotionValue`s that update when the viewport scrolls.
 *
 * @remarks
 *
 * This makes it possible to transform viewport scrolls into other values.
 *
 * Four `MotionValue`s are returned:
 *
 *  - `scrollX`/`scrollY`: The x/y scroll offset in pixels.
 *  - `scrollXProgress`/`scrollYProgress`: The x/y scroll offset as a progress value between `0` and `1`.
 *
 * ```jsx
 * const { scrollX } = useViewportScrollValues()
 * ```
 *
 * @returns `{ scrollX, scrollY, scrollXProgress, scrollYProgress }` `MotionValue`s
 *
 * @public
 */
export const useViewportScrollValues = () => {
    if (!hasEventListener) {
        addScrollListener()
    }

    return viewportMotionValues
}
