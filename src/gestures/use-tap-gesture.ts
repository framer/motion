import { RefObject, useEffect, useMemo } from "react"
import { usePointerEvents, useConditionalPointerEvents, EventInfo, Point, EventHandler } from "../events"
import { AnimationManager } from "../animation"
import { VariantLabels } from "../motion/types"
import { Target } from "../types"
import { AnimationControls } from "../motion"

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
    onPressStart?: TapHandler
    onPressEnd?: TapHandler
    pressActive?: VariantLabels | Target
}

export interface Animation {
    controls?: AnimationControls
    animate?: AnimationManager | VariantLabels | Target
    initial?: VariantLabels | Target
}

export function useTapGesture(handlers: TapHandlers & Animation): { onPointerDown: EventHandler }
export function useTapGesture(handlers: TapHandlers & Animation, ref: RefObject<Element>): undefined
export function useTapGesture(
    { onTap, onPressStart, onPressEnd, pressActive, controls, animate, initial }: TapHandlers & Animation,
    ref?: RefObject<Element>
): undefined | { onPointerDown: EventHandler } {
    let session: TapSession | null = null

    const onPointerUp = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session) {
                    return
                }

                if (onPressEnd) {
                    onPressEnd({ point, devicePoint }, event)
                }

                if (!ref || event.target !== ref.current) {
                    return
                }

                if (onTap) {
                    onTap({ point, devicePoint }, event)
                }

                if (controls && pressActive) {
                    if (animate && !(animate instanceof AnimationManager)) {
                        controls.start(animate)
                    } else if (initial) {
                        controls.start(initial)
                    }
                }

                session = null
            }
        },
        [onTap]
        //   [onTap, dragging, device.current]
    )

    const onPointerDown = (event: Event, { point, devicePoint }: EventInfo) => {
        startPointerUp()
        if (!ref || event.target !== ref.current) return
        session = {
            target: event.target,
        }

        if (onPressStart) {
            onPressStart({ point, devicePoint }, event)
        }

        if (controls && pressActive) {
            controls.start(pressActive)
        }
    }
    const [startPointerUp, stopPointerUp] = usePointerEvents({ onPointerUp }, window)
    useEffect(
        () => {
            return () => {
                stopPointerUp()
            }
        },
        [ref && ref.current, onPointerUp]
    )
    return useConditionalPointerEvents({ onPointerDown }, ref)
}
