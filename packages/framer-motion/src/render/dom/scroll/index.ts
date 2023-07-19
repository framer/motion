import { ScrollOptions, OnScroll } from "./types"
import { cancelFrame, frame } from "../../../frameloop"
import { memo } from "../../../utils/memo"
import { scrollInfo } from "./track"

const supportsScrollTimeline = memo(() => window.ScrollTimeline !== undefined)

declare class ScrollTimeline {
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

export function scroll(onScroll: OnScroll, options?: ScrollOptions) {
    const timeline = getTimeline(options)

    let prevProgress: number

    const onFrame = () => {
        const { currentTime } = timeline
        const percentage = currentTime === null ? 0 : currentTime.value
        const progress = percentage / 100

        if (prevProgress !== progress) {
            onScroll(progress)
        }

        prevProgress = progress
    }

    frame.update(onFrame, true)

    return () => {
        cancelFrame(onFrame)
        if (timeline.cancel) timeline.cancel()
    }
}
