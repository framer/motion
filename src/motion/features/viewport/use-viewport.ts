import { MutableRefObject, useEffect, useRef } from "react"
import { VisualElement } from "../../../render/types"
import { AnimationType } from "../../../render/utils/types"
import { FeatureProps } from "../types"
import { createIntersectionObserver } from "./observers"
import { ViewportOptions } from "./types"

export function useViewport({
    visualElement,
    whileInView,
    onViewportEnter,
    onViewportLeave,
    viewport = {},
}: FeatureProps) {
    const hasEnteredView = useRef(false)

    let shouldObserve = Boolean(
        whileInView || onViewportEnter || onViewportLeave
    )

    if (viewport.once && hasEnteredView.current) shouldObserve = false

    const useObserver =
        typeof IntersectionObserver === "undefined"
            ? useMissingIntersectionObserver
            : useIntersectionObserver

    useObserver(shouldObserve, hasEnteredView, visualElement, viewport)
}

function useIntersectionObserver(
    shouldObserve: boolean,
    hasEnteredView: MutableRefObject<boolean>,
    visualElement: VisualElement,
    { root, margin: rootMargin, amount = "some", once }: ViewportOptions
) {
    useEffect(() => {
        if (!shouldObserve) return

        return createIntersectionObserver(
            visualElement.getInstance(),
            {
                root: root?.current,
                rootMargin,
                threshold: amount === "some" ? 0 : 1,
            },
            (entry) => {
                const { isIntersecting } = entry

                if (once && !isIntersecting && hasEnteredView.current) {
                    return
                } else if (isIntersecting) {
                    hasEnteredView.current = true
                }

                visualElement.animationState?.setActive(
                    AnimationType.InView,
                    isIntersecting
                )

                /**
                 * Use the latest committed props rather than the ones in scope
                 * when this observer is created
                 */
                const props = visualElement.getProps()
                const callback = isIntersecting
                    ? props.onViewportEnter
                    : props.onViewportLeave
                callback?.()
            }
        )
    }, [shouldObserve, root, rootMargin, amount])
}

function useMissingIntersectionObserver(
    shouldObserve: boolean,
    hasEnteredView: MutableRefObject<boolean>,
    visualElement: VisualElement
) {
    useEffect(() => {
        if (!shouldObserve) return

        requestAnimationFrame(() => {
            hasEnteredView.current = true
            const { onViewportEnter } = visualElement.getProps()
            onViewportEnter?.()
            visualElement.animationState?.setActive(AnimationType.InView, true)
        })
    }, [shouldObserve])
}
