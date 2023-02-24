import { MotionProps } from "../../types"
import { Feature } from "../Feature"
import { observeIntersection } from "./observers"

const thresholdNames = {
    some: 0,
    all: 1,
}

export class InViewFeature extends Feature<Element> {
    private hasEnteredView = false

    private isInView = false

    /**
     * TODO: Remove this in 10.0
     */
    private viewportFallback() {
        /**
         * Fire this in an rAF because, at this point, the animation state
         * won't have flushed for the first time and there's certain logic in
         * there that behaves differently on the initial animation.
         */
        requestAnimationFrame(() => {
            this.hasEnteredView = true
            const { onViewportEnter } = this.node.getProps()
            onViewportEnter && onViewportEnter(null)
            if (this.node.animationState) {
                this.node.animationState.setActive("whileInView", true)
            }
        })
    }

    private startObserver() {
        this.unmount()

        const { viewport = {} } = this.node.getProps()
        const {
            root,
            margin: rootMargin,
            amount = "some",
            once,
            fallback = true,
        } = viewport

        if (typeof IntersectionObserver === "undefined") {
            if (fallback) this.viewportFallback()
            return
        }

        const options = {
            root: root ? root.current : undefined,
            rootMargin,
            threshold:
                typeof amount === "number" ? amount : thresholdNames[amount],
        }

        const onIntersectionUpdate = (entry: IntersectionObserverEntry) => {
            const { isIntersecting } = entry

            /**
             * If there's been no change in the viewport state, early return.
             */
            if (this.isInView === isIntersecting) return

            this.isInView = isIntersecting

            /**
             * Handle hasEnteredView. If this is only meant to run once, and
             * element isn't visible, early return. Otherwise set hasEnteredView to true.
             */
            if (once && !isIntersecting && this.hasEnteredView) {
                return
            } else if (isIntersecting) {
                this.hasEnteredView = true
            }

            if (this.node.animationState) {
                this.node.animationState.setActive(
                    "whileInView",
                    isIntersecting
                )
            }

            /**
             * Use the latest committed props rather than the ones in scope
             * when this observer is created
             */
            const { onViewportEnter, onViewportLeave } = this.node.getProps()
            const callback = isIntersecting ? onViewportEnter : onViewportLeave
            callback && callback(entry)
        }

        return observeIntersection(
            this.node.current!,
            options,
            onIntersectionUpdate
        )
    }

    mount() {
        this.startObserver()
    }

    update() {
        if (typeof IntersectionObserver === "undefined") return

        const { props, prevProps } = this.node
        const hasOptionsChanged = ["amount", "margin", "root"].some(
            hasViewportOptionChanged(props, prevProps)
        )

        if (hasOptionsChanged) {
            this.startObserver()
        }
    }

    unmount() {}
}

function hasViewportOptionChanged(
    { viewport = {} }: MotionProps,
    { viewport: prevViewport = {} }: MotionProps = {}
) {
    return (name: string) => viewport[name] !== prevViewport[name]
}
