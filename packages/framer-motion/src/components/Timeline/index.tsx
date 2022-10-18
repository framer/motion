import * as React from "react"
import { TimelineProps } from "./types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { TimelineContext } from "./context"
import { useMotionValue } from "../../value/use-motion-value"
import { animate as animateMotionValue } from "../../animation/animate"
import { useConstant } from "../../utils/use-constant"
import { createTimeline } from "./timeline"

export function Timeline({
    initial = true,
    animate,
    progress,
    children,
}: TimelineProps) {
    const timeProgress = useMotionValue(initial ? 0 : 1)
    const timelineProgress = progress || timeProgress

    const timeline = useConstant(() =>
        createTimeline(animate, timelineProgress)
    )

    useIsomorphicLayoutEffect(() => {
        if (timelineProgress === progress) {
        } else {
            animateMotionValue(timeProgress, [0, 1])
        }
    }, [JSON.stringify(animate)])

    return (
        <TimelineContext.Provider value={timeline}>
            {children}
        </TimelineContext.Provider>
    )
}
