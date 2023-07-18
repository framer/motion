import { cancelFrame, frame } from "../../../frameloop"
import { memo } from "../../../utils/memo"
import { scrollInfo } from "./track"

declare class ScrollTimeline {
    constructor(options: ScrollProgressOptions)

    currentTime: null | number | { value: number }
}

declare global {
    interface Window {
        ScrollTimeline: ScrollTimeline
    }
}

export interface ScrollProgressOptions {
    source?: Element
    axis?: "x" | "y"
}

export type OnScrollProgress = (progress: number) => void

class ScrollTimelinePolyfill {
    scrollInfo: VoidFunction

    constructor({ source, axis = "y" }: ScrollProgressOptions) {
        this.scrollInfo = scrollInfo(
            (info) => {
                console.log(info)
                const axisInfo = info[axis]
                this.currentTime = axisInfo.progress * 100
            },
            { container: source as HTMLElement, axis }
        )
    }

    currentTime = 0
}

const supportsScrollTimeline = memo(() => window.ScrollTimeline !== undefined)

const timelineCache = new Map<
    Element,
    { x?: ScrollTimeline; y?: ScrollTimeline }
>()

function getTimeline(source: Element, axis: "x" | "y") {
    if (!timelineCache.has(source)) {
        timelineCache.set(source, {})
    }

    const elementCache = timelineCache.get(source)!

    if (!elementCache[axis]) {
        elementCache[axis] = supportsScrollTimeline()
            ? new ScrollTimeline({ source, axis })
            : new ScrollTimelinePolyfill({ source, axis })
    }

    return elementCache[axis]!
}

export function scroll(
    onScroll: OnScrollProgress,
    {
        source = document.documentElement,
        axis = "y",
    }: ScrollProgressOptions = {}
) {
    console.log(axis)
    const timeline = getTimeline(source, axis)

    let prevProgress = 0

    const onFrame = () => {
        const { currentTime } = timeline
        const percentage =
            typeof currentTime === "number"
                ? currentTime
                : currentTime === null
                ? 0
                : currentTime.value
        const progress = percentage / 100

        if (prevProgress !== progress) {
            onScroll(progress)
        }

        prevProgress = progress
    }

    frame.update(onFrame, true)

    return () => cancelFrame(onFrame)
}
