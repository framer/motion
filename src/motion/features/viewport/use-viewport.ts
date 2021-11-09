import { useEffect, useRef } from "react"
import { AnimationType } from "../../../render/utils/types"
import { FeatureProps } from "../types"

export function useViewport({
    visualElement,
    whileInView,
    onViewportEnter,
    onViewportLeave,
    viewport = {},
}: FeatureProps) {
    const { root, margin: rootMargin, once, amount = "some" } = viewport
    const hasEnteredView = useRef(false)

    let shouldObserve = Boolean(
        whileInView || onViewportEnter || onViewportLeave
    )

    if (once && hasEnteredView.current) shouldObserve = false

    useEffect(() => {
        if (!shouldObserve) return

        const { animationState } = visualElement

        if (typeof IntersectionObserver === "undefined") {
            animationState?.setActive(AnimationType.InView, true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const { isIntersecting } = entry
                if (once && !isIntersecting && hasEnteredView.current) {
                    return
                } else if (isIntersecting) {
                    hasEnteredView.current = true
                }

                animationState?.setActive(AnimationType.InView, isIntersecting)

                const callback = isIntersecting
                    ? onViewportEnter
                    : onViewportLeave
                callback?.(entry)
            },
            {
                root: root?.current,
                rootMargin,
                threshold: amount === "some" ? 0 : 1,
            }
        )

        observer.observe(visualElement.getInstance())

        return () => observer.disconnect()
    }, [shouldObserve, root])
}
