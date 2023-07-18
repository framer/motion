import { GroupPlaybackControls } from "../../../animation/GroupPlaybackControls"
import { memo } from "../../../utils/memo"
import { scroll } from "./index"

declare class ScrollTimeline {
    constructor(options: ScrollProgressOptions)

    currentTime: number | { value: number }
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
        this.scrollInfo = scroll(
            (info) => {
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

export function scrollProgress(
    target: OnScrollProgress | GroupPlaybackControls,
    {
        source = document.documentElement,
        axis = "y",
    }: ScrollProgressOptions = {}
) {
    const timeline = getTimeline(source, axis)

    /**
     *
     */
    if (
        typeof target === "function" ||
        timeline instanceof ScrollTimelinePolyfill
    ) {
    } else {
        target.timeline = timeline
    }

    // const onScroll =
    //     typeof target === "function" ? target : scrubAnimation(target)

    // let prevProgress = 0

    // const onFrame = () => {
    //     const { currentTime } = timeline
    //     const percentage =
    //         typeof currentTime === "number" ? currentTime : currentTime.value
    //     const progress = percentage / 100

    //     if (prevProgress !== progress) {
    //         onScroll(progress)
    //     }

    //     prevProgress = progress
    // }

    // frame.update(onFrame, true)

    // return () => cancelFrame(onFrame)
}
