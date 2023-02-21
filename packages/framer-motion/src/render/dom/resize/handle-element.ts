import { ElementOrSelector, resolveElements } from "../utils/resolve-element"
import { ResizeHandler } from "./types"

const resizeHandlers = new WeakMap<Element, Set<ResizeHandler<Element>>>()

let observer: ResizeObserver | undefined

function getElementSize(
    target: Element,
    borderBoxSize?: ReadonlyArray<ResizeObserverSize>
) {
    if (borderBoxSize) {
        const { inlineSize, blockSize } = borderBoxSize[0]
        return { width: inlineSize, height: blockSize }
    } else if (target instanceof SVGElement && "getBBox" in target) {
        return (target as SVGGraphicsElement).getBBox()
    } else {
        return {
            width: (target as HTMLElement).offsetWidth,
            height: (target as HTMLElement).offsetHeight,
        }
    }
}

function notifyTarget({
    target,
    contentRect,
    borderBoxSize,
}: ResizeObserverEntry) {
    resizeHandlers.get(target)?.forEach((handler) => {
        handler({
            target,
            contentSize: contentRect,
            get size() {
                return getElementSize(target, borderBoxSize)
            },
        })
    })
}

function notifyAll(entries: ResizeObserverEntry[]) {
    entries.forEach(notifyTarget)
}

function createResizeObserver() {
    if (typeof ResizeObserver === "undefined") return

    observer = new ResizeObserver(notifyAll)
}

export function resizeElement(
    target: ElementOrSelector,
    handler: ResizeHandler<Element>
) {
    if (!observer) createResizeObserver()

    const elements = resolveElements(target)

    elements.forEach((element) => {
        let elementHandlers = resizeHandlers.get(element)

        if (!elementHandlers) {
            elementHandlers = new Set()
            resizeHandlers.set(element, elementHandlers)
        }

        elementHandlers.add(handler)
        observer?.observe(element)
    })

    return () => {
        elements.forEach((element) => {
            const elementHandlers = resizeHandlers.get(element)

            elementHandlers?.delete(handler)

            if (!elementHandlers?.size) {
                observer?.unobserve(element)
            }
        })
    }
}
