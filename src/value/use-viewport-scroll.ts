import { invariant } from "hey-listen"
import { useLayoutEffect, RefObject } from "react"
import { MotionValue } from "../value"
import { useMotionValue } from "./use-motion-value"

export interface ScrollMotionValues {
    scrollX: MotionValue<number>
    scrollY: MotionValue<number>
    scrollXProgress: MotionValue<number>
    scrollYProgress: MotionValue<number>
}

function getWindowOffsets() {
    return {
        xOffset: window.pageXOffset,
        yOffset: window.pageYOffset,
        xMaxOffset: document.body.clientWidth - window.innerWidth,
        yMaxOffset: document.body.clientHeight - window.innerHeight,
    }
}

function getElementOffsets(element: HTMLElement) {
    return {
        xOffset: element.scrollLeft,
        yOffset: element.scrollTop,
        xMaxOffset: element.scrollWidth - element.offsetWidth,
        yMaxOffset: element.scrollHeight - element.offsetHeight,
    }
}

function createWindowListeners(updateCallback) {
    window.addEventListener("resize", updateCallback)
    window.addEventListener("scroll", updateCallback, { passive: true })
    return () => {
        window.removeEventListener("resize", updateCallback)
        window.removeEventListener("scroll", updateCallback, { passive: true })
    }
}

function createElementListeners(element: HTMLElement, updateCallback) {
    let resizeObserver
    if (window.ResizeObserver) {
        resizeObserver = new window.ResizeObserver(updateCallback)
        resizeObserver.observe(element)
    }
    element.addEventListener("scroll", updateCallback, { passive: true })
    return () => {
        if (resizeObserver) {
            resizeObserver.disconnect()
        }
        element.removeEventListener("scroll", updateCallback, { passive: true })
    }
}

function setProgress(offset: number, maxOffset: number, value: MotionValue) {
    value.set(!offset || !maxOffset ? 0 : offset / maxOffset)
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
 * @public
 */

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
export function useViewportScroll(ref: undefined | RefObject<Element>) {
    const scrollX = useMotionValue(0)
    const scrollY = useMotionValue(0)
    const scrollXProgress = useMotionValue(0)
    const scrollYProgress = useMotionValue(0)
    const viewportMotionValues: ScrollMotionValues = {
        scrollX,
        scrollY,
        scrollXProgress,
        scrollYProgress,
    }

    invariant(
        (ref && ref.current !== null) || true,
        "If passing a React ref, that ref must be passed to another component's `ref` prop."
    )

    useLayoutEffect(() => {
        const isElement = Boolean(ref)
        const updateScrollValues = () => {
            const { xOffset, yOffset, xMaxOffset, yMaxOffset } = isElement
                ? getElementOffsets(ref.current)
                : getWindowOffsets()

            // Set absolute positions
            scrollX.set(xOffset)
            scrollY.set(yOffset)

            // Set 0-1 progress
            setProgress(xOffset, xMaxOffset, scrollXProgress)
            setProgress(yOffset, yMaxOffset, scrollYProgress)
        }
        const removeEventListeners = isElement
            ? createElementListeners(ref.current, updateScrollValues)
            : createWindowListeners(updateScrollValues)

        updateScrollValues()

        return removeEventListeners
    })

    return viewportMotionValues
}
