import * as React from "react"
import { PropsWithChildren } from "react"
import { TimelineProps } from "./types"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { TimelineContext } from "./context"
import { useConstant } from "../../utils/use-constant"
import { createTimeline } from "./timeline"

export function Timeline({
    children,
    ...props
}: PropsWithChildren<TimelineProps>) {
    const timeline = useConstant(() => createTimeline(props))

    useIsomorphicLayoutEffect(() => {
        timeline.update(props)
    }, [JSON.stringify(props.animate)])

    return (
        <TimelineContext.Provider value={timeline}>
            {children}
        </TimelineContext.Provider>
    )
}
