import { RefObject, useEffect, useMemo } from "react"
import {
    usePointerEvents,
    useConditionalPointerEvents,
    EventInfo,
    Point,
    EventHandler,
} from "../events"
import { AnimationManager } from "../animation"
import { VariantLabels } from "../motion/types"
import { Target, TargetAndTransition } from "../types"
import { AnimationControls } from "../motion"
import { getGesturePriority } from "./utils/gesture-priority"

interface TapInfo {
    point: Point
    devicePoint: Point
}

interface TapSession {
    target: EventTarget | null
}

type TapHandler = (session: TapInfo, event: Event) => void

export interface TapHandlers {
    onTap?: TapHandler
    onTapStart?: TapHandler
    onTapCancel?: TapHandler
    tapActive?: string | TargetAndTransition
}

export interface Animation {
    controls?: AnimationControls
    animate?: AnimationManager | VariantLabels | Target
    initial?: VariantLabels | Target
}

export function useTapGesture(
    handlers: TapHandlers & Animation
): { onPointerDown: EventHandler }
export function useTapGesture(
    handlers: TapHandlers & Animation,
    ref: RefObject<Element>
): undefined
export function useTapGesture(
    {
        onTap,
        onTapStart,
        onTapCancel,
        tapActive,
        controls,
    }: TapHandlers & Animation,
    ref?: RefObject<Element>
): undefined | { onPointerDown: EventHandler } {
    let session: TapSession | null = null

    const onPointerUp = useMemo(
        () => (event: Event, { point, devicePoint }: EventInfo) => {
            if (!session) {
                return
            }

            if (controls && tapActive) {
                controls.clearOverride(getGesturePriority("tap"))
            }

            if (!ref || event.target !== ref.current) {
                if (onTapCancel) {
                    onTapCancel({ point, devicePoint }, event)
                }
                return
            }

            if (onTap) {
                onTap({ point, devicePoint }, event)
            }

            session = null
        },
        [onTap]
    )

    const onPointerDown = useMemo(
        () => (event: Event, { point, devicePoint }: EventInfo) => {
            startPointerUp()
            if (!ref || event.target !== ref.current) return
            session = {
                target: event.target,
            }

            if (onTapStart) {
                onTapStart({ point, devicePoint }, event)
            }

            if (controls && tapActive) {
                controls.start(tapActive, {
                    priority: getGesturePriority("tap"),
                })
            }
        },
        [onPointerUp]
    )

    const [startPointerUp, stopPointerUp] = usePointerEvents(
        { onPointerUp },
        window
    )

    useEffect(
        () => () => {
            stopPointerUp()
        },
        [ref && ref.current, onPointerUp]
    )

    return useConditionalPointerEvents({ onPointerDown }, ref)
}
