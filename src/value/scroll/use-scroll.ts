import { RefObject } from "react"
import { useElementScroll } from "./use-element-scroll"
import { useViewportScroll } from "./use-viewport-scroll"

/**
 * Returns MotionValues that update when the provided element or viewport scrolls:
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll progress between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll progress between `0` and `1`.
 *
 * `useScroll` conditionally accepts a ref containing a HTMLElement. If provided, the
 * scroll event listeners will be attached to that element. If no element is
 * provided, the scroll event listeners will be attached to the viewport.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import {
 *   Frame,
 *   useScroll,
 *   useTransform
 * } from "framer"
 *
 * export function MyComponent() {
 *   const { scrollYProgress } = useScroll()
 *   return <Frame scaleX={scrollYProgress} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const { scrollYProgress } = useScroll()
 *   return <motion.div style={{ scaleX: scrollYProgress }} />
 * }
 * ```
 */
export function useScroll(ref?: RefObject<HTMLElement>) {
    return ref ? useElementScroll(ref) : useViewportScroll()
}
