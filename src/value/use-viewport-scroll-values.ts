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
 * `useViewportScroll` provides `MotionValue`s that update when the viewport scrolls.
 *
 * This makes it possible to transform viewport scroll into other values.
 *
 * For instance, highlighting different table of contents items to correspond with page scroll.
 */
export const useViewportScrollValues = () => {
    if (!hasEventListener) {
        addScrollListener()
    }

    return viewportMotionValues
}
