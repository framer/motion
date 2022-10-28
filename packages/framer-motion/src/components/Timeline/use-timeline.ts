import { useContext, useMemo } from "react"
import { useIsomorphicLayoutEffect } from "../../three-entry"
import { motionValue, MotionValue } from "../../value"
import { TimelineContext } from "./context"

export type TimelineMotionValues<T> = { [K in keyof T]: MotionValue<T[K]> }

export function useTimeline<T extends Record<string, unknown>>(
    trackId: string,
    initialValues: T
): TimelineMotionValues<T> {
    const timeline = useContext(TimelineContext)
    const values = useMemo(() => {
        const motionValues: Partial<TimelineMotionValues<T>> = {}
        const initialTrackValues = timeline?.getInitialValues(trackId)
        for (const key in initialValues) {
            let initialValue = initialValues[key]
            if (initialTrackValues && initialTrackValues[key]) {
                initialValue = initialTrackValues[key] as any
            }

            motionValues[key] = motionValue(initialValue)
        }

        return motionValues as TimelineMotionValues<T>
    }, [])

    useIsomorphicLayoutEffect(
        () => timeline?.registerMotionValues(trackId, values),
        [trackId, values]
    )

    return values
}
