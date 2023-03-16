import { ElementOrSelector } from "../../../animation/types"
import { resolveElements } from "../utils/resolve-element"

export type ViewChangeHandler = (entry: IntersectionObserverEntry) => void

export interface InViewOptions {
    root?: Element | Document
    margin?: string
    amount?: "any" | "all" | number
}

const thresholds = {
    any: 0,
    all: 1,
}

export function inView(
    elementOrSelector: ElementOrSelector,
    onStart: (entry: IntersectionObserverEntry) => void | ViewChangeHandler,
    { root, margin: rootMargin, amount = "any" }: InViewOptions = {}
): VoidFunction {
    const elements = resolveElements(elementOrSelector)

    const activeIntersections = new WeakMap<Element, ViewChangeHandler>()

    const onIntersectionChange: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
            const onEnd = activeIntersections.get(entry.target)

            /**
             * If there's no change to the intersection, we don't need to
             * do anything here.
             */
            if (entry.isIntersecting === Boolean(onEnd)) return

            if (entry.isIntersecting) {
                const newOnEnd = onStart(entry)
                if (typeof newOnEnd === "function") {
                    activeIntersections.set(entry.target, newOnEnd)
                } else {
                    observer.unobserve(entry.target)
                }
            } else if (onEnd) {
                onEnd(entry)
                activeIntersections.delete(entry.target)
            }
        })
    }

    const observer = new IntersectionObserver(onIntersectionChange, {
        root,
        rootMargin,
        threshold: typeof amount === "number" ? amount : thresholds[amount],
    })

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
}
