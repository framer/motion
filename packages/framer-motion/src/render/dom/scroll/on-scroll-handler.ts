import { updateScrollInfo } from "./info"
import { resolveOffsets } from "./offsets/index"
import { OnScroll, OnScrollHandler, ScrollInfo, ScrollOptions } from "./types"

function measure(
    container: HTMLElement,
    target: Element = container,
    info: ScrollInfo
) {
    /**
     * Find inset of target within scrollable container
     */
    info.x.targetOffset = 0
    info.y.targetOffset = 0
    if (target !== container) {
        let node = target as HTMLElement
        while (node && node !== container) {
            info.x.targetOffset += node.offsetLeft
            info.y.targetOffset += node.offsetTop
            node = node.offsetParent as HTMLElement
        }
    }

    info.x.targetLength =
        target === container ? target.scrollWidth : target.clientWidth
    info.y.targetLength =
        target === container ? target.scrollHeight : target.clientHeight
    info.x.containerLength = container.clientWidth
    info.y.containerLength = container.clientHeight
}

export function createOnScrollHandler(
    element: HTMLElement,
    onScroll: OnScroll,
    info: ScrollInfo,
    options: ScrollOptions = {}
): OnScrollHandler {
    return {
        measure: () => measure(element, options.target, info),
        update: (time) => {
            updateScrollInfo(element, info, time)

            if (options.offset || options.target) {
                resolveOffsets(element, info, options)
            }
        },
        notify: () => onScroll(info),
    }
}
