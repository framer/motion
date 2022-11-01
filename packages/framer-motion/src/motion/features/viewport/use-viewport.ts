import { env } from "../../../utils/process"
import { useEffect, useRef } from "react"
import type { VisualElement } from "../../../render/VisualElement"
import { AnimationType } from "../../../render/utils/types"
import { warnOnce } from "../../../utils/warn-once"
import { FeatureProps } from "../types"
import { observeIntersection } from "./observers"
import { ViewportOptions, ViewportState } from "./types"

export function useViewport({
    visualElement,
    whileInView,
    onViewportEnter,
    onViewportLeave,
    viewport = {},
}: FeatureProps<HTMLElement>) {
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

const thresholdNames = {
    some: 0,
    all: 1,
}

function useIntersectionObserver(
    shouldObserve: boolean,
    state: ViewportState,
    visualElement: VisualElement<HTMLElement>,
    { root, margin: rootMargin, amount = "some", once }: ViewportOptions
) {
    useEffect(() => {
        if (!shouldObserve) return

        const options = {
            root: root?.current,
            rootMargin,
            threshold:
                typeof amount === "number" ? amount : thresholdNames[amount],
        }

        const intersectionCallback = (entry: IntersectionObserverEntry) => {
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

            if (visualElement.animationState) {
                visualElement.animationState.setActive(
                    AnimationType.InView,
                    isIntersecting
                )
            }

            /**
             * Use the latest committed props rather than the ones in scope
             * when this observer is created
             */
            const props = visualElement.getProps()
            const callback = isIntersecting
                ? props.onViewportEnter
                : props.onViewportLeave
            callback && callback(entry)
        }

        return observeIntersection(
            visualElement.current!,
            options,
            intersectionCallback
        )
    }, [shouldObserve, root, rootMargin, amount])
}

/**
 * If IntersectionObserver is missing, we activate inView and fire onViewportEnter
 * on mount. This way, the page will be in the state the author expects users
 * to see it in for everyone.
 */
function useMissingIntersectionObserver(
    shouldObserve: boolean,
    state: ViewportState,
    visualElement: VisualElement,
    { fallback = true }: ViewportOptions
) {
    useEffect(() => {
        if (!shouldObserve || !fallback) return

        if (env !== "production") {
            warnOnce(
                false,
                "IntersectionObserver not available on this device. whileInView animations will trigger on mount."
            )
        }

        /**
         * Fire this in an rAF because, at this point, the animation state
         * won't have flushed for the first time and there's certain logic in
         * there that behaves differently on the initial animation.
         *
         * This hook should be quite rarely called so setting this in an rAF
         * is preferred to changing the behaviour of the animation state.
         */
        requestAnimationFrame(() => {
            state.hasEnteredView = true
            const { onViewportEnter } = visualElement.getProps()
            onViewportEnter && onViewportEnter(null)
            if (visualElement.animationState) {
                visualElement.animationState.setActive(
                    AnimationType.InView,
                    true
                )
            }
        })
    }, [shouldObserve])
}
