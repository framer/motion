import { useEffect, useRef } from "react"
import { VisualElement } from "../../../render/types"
import { AnimationType } from "../../../render/utils/types"
import { FeatureProps } from "../types"
import { createIntersectionObserver } from "./observers"
import { ViewportOptions, ViewportState } from "./types"

export function useViewport({
    visualElement,
    whileInView,
    onViewportEnter,
    onViewportLeave,
    viewport = {},
}: FeatureProps) {
    const state = useRef<ViewportState>({
        hasEnteredView: false,
        isInView: false,
    })

    let shouldObserve = Boolean(
        whileInView || onViewportEnter || onViewportLeave
    )

    if (viewport.once && state.current.hasEnteredView) shouldObserve = false

    const useObserver =
        typeof IntersectionObserver === "undefined"
            ? useMissingIntersectionObserver
            : useIntersectionObserver

    useObserver(shouldObserve, state.current, visualElement, viewport)
}

function useIntersectionObserver(
    shouldObserve: boolean,
    state: ViewportState,
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

                /**
                 * If there's been no change in the viewport state, early return.
                 */
                if (state.isInView === isIntersecting) return

                state.isInView = isIntersecting

                /**
                 * Handle hasEnteredView. If this is only meant to run once, and
                 * element isn't visible, early return. Otherwise set hasEnteredView to true.
                 */
                if (once && !isIntersecting && state.hasEnteredView) {
                    return
                } else if (isIntersecting) {
                    state.hasEnteredView = true
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
    state: ViewportState,
    visualElement: VisualElement
) {
    useEffect(() => {
        if (!shouldObserve) return

        requestAnimationFrame(() => {
            state.hasEnteredView = true
            const { onViewportEnter } = visualElement.getProps()
            onViewportEnter?.()
            visualElement.animationState?.setActive(AnimationType.InView, true)
        })
    }, [shouldObserve])
}
