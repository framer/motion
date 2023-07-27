import { ScrollOptions, OnScroll } from "./types"
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

function scrollTimelineFallback({ source, axis = "y" }: ScrollOptions) {
    // ScrollTimeline records progress as a percentage CSSUnitValue
    const currentTime = { value: 0 }

    const cancel = scrollInfo(
        (info) => {
            currentTime.value = info[axis].progress * 100
        },
        { container: source as HTMLElement, axis }
    )

    return { currentTime, cancel }
}

const timelineCache = new Map<
    Element,
    { x?: ScrollTimeline; y?: ScrollTimeline }
>()

function getTimeline({
    source = document.documentElement,
    axis = "y",
}: ScrollOptions = {}): ScrollTimeline {
    if (!timelineCache.has(source)) {
        timelineCache.set(source, {})
    }

    const elementCache = timelineCache.get(source)!

    if (!elementCache[axis]) {
        elementCache[axis] = supportsScrollTimeline()
            ? new ScrollTimeline({ source, axis })
            : scrollTimelineFallback({ source, axis })
    }

    return elementCache[axis]!
}

export function scroll(
    onScroll: OnScroll | GroupPlaybackControls,
    options?: ScrollOptions
): VoidFunction {
    const timeline = getTimeline(options)

    if (typeof onScroll === "function") {
        return observeTimeline(onScroll, timeline)
    } else {
        return onScroll.attachTimeline(timeline)
    }
}
