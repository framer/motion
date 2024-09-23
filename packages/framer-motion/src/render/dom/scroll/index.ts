import { ScrollOptions, OnScroll, OnScrollWithInfo } from "./types"
import { scrollInfo } from "./track"
import { GroupPlaybackControls } from "../../../animation/GroupPlaybackControls"
import { ProgressTimeline, observeTimeline } from "./observe"
import { supportsScrollTimeline } from "./supports"

declare class ScrollTimeline implements ProgressTimeline {
    constructor(options: ScrollOptions)

    currentTime: null | { value: number }

    cancel?: VoidFunction
}

declare global {
    interface Window {
        ScrollTimeline: ScrollTimeline
    }
}

function scrollTimelineFallback({
    source,
    container,
    axis = "y",
}: ScrollOptions) {
    // Support legacy source argument. Deprecate later.
    if (source) container = source

    // ScrollTimeline records progress as a percentage CSSUnitValue
    const currentTime = { value: 0 }

    const cancel = scrollInfo(
        (info) => {
            currentTime.value = info[axis].progress * 100
        },
        { container, axis }
    )

    return { currentTime, cancel }
}

const timelineCache = new Map<
    Element,
    { x?: ScrollTimeline; y?: ScrollTimeline }
>()

function getTimeline({
    source,
    container = document.documentElement,
    axis = "y",
}: ScrollOptions = {}): ScrollTimeline {
    // Support legacy source argument. Deprecate later.
    if (source) container = source

    if (!timelineCache.has(container)) {
        timelineCache.set(container, {})
    }

    const elementCache = timelineCache.get(container)!

    if (!elementCache[axis]) {
        elementCache[axis] = supportsScrollTimeline()
            ? new ScrollTimeline({ source: container, axis })
            : scrollTimelineFallback({ source: container, axis })
    }

    return elementCache[axis]!
}

function isOnScrollWithInfo(onScroll: OnScroll): onScroll is OnScrollWithInfo {
    return onScroll.length === 2
}

function needsMainThreadScrollTracking(options?: ScrollOptions) {
    return options && (options.target || options.offset)
}

export function scroll(
    onScroll: OnScroll | GroupPlaybackControls,
    options?: ScrollOptions
): VoidFunction {
    const axis = options?.axis || "y"
    if (typeof onScroll === "function") {
        /**
         * If the onScroll function has two arguments, it's expecting
         * more specific information about the scroll from scrollInfo.
         */
        if (
            isOnScrollWithInfo(onScroll) ||
            needsMainThreadScrollTracking(options)
        ) {
            return scrollInfo((info) => {
                onScroll(info[axis].progress, info)
            }, options)
        } else {
            return observeTimeline(onScroll, getTimeline(options))
        }
    } else {
        /**
         * If we need main thread scroll tracking because we're tracking
         * a target or defined offsets, we need to create a scrollInfo timeline.
         * Over time the number of sitauations where this is true
         */
        if (needsMainThreadScrollTracking(options)) {
            onScroll.pause()
            return scrollInfo((info) => {
                onScroll.time = onScroll.duration * info[axis].progress
            }, options)
        } else {
            return onScroll.attachTimeline(getTimeline(options))
        }
    }
}
