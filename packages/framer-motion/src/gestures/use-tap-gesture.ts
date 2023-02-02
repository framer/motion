import { useCallback, useRef } from "react"
import { EventInfo } from "../events/types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { addPointerEvent, usePointerEvent } from "../events/use-pointer-event"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { AnimationType } from "../render/utils/types"
import { isDragActive } from "./drag/utils/lock"
import { FeatureProps } from "../motion/features/types"
import { pipe } from "../utils/pipe"
import { addDomEvent, useDomEvent } from "../events/use-dom-event"
import {
    EventListenerWithPointInfo,
    extractEventInfo,
} from "../events/event-info"

function fireSyntheticPointerEvent(
    name: string,
    handler?: EventListenerWithPointInfo
) {
    if (!handler) return
    const syntheticPointerEvent = new PointerEvent("pointer" + name)
    handler(syntheticPointerEvent, extractEventInfo(syntheticPointerEvent))
}

/**
 * @param handlers -
 * @internal
 */
export function useTapGesture({
    onTap,
    onTapStart,
    onTapCancel,
    whileTap,
    visualElement,
    ...props
}: FeatureProps<HTMLElement>) {
    const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap
    const isPressing = useRef(false)
    const cancelPointerEndListeners = useRef<Function | null>(null)

    /**
     * Only set listener to passive if there are no external listeners.
     */
    const eventOptions = {
        passive: !(
            onTapStart ||
            onTap ||
            onTapCancel ||
            props["onPointerDown"]
        ),
    }

    function removePointerEndListener() {
        cancelPointerEndListeners.current && cancelPointerEndListeners.current()
        cancelPointerEndListeners.current = null
    }

    function checkPointerEnd() {
        removePointerEndListener()
        isPressing.current = false

        const latestProps = visualElement.getProps()
        if (latestProps.whileTap && visualElement.animationState) {
            visualElement.animationState.setActive(AnimationType.Tap, false)
        }

        return !isDragActive()
    }

    function onPointerUp(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        !isNodeOrChild(visualElement.current, event.target as Element)
            ? visualElement.getProps().onTapCancel?.(event, info)
            : visualElement.getProps().onTap?.(event, info)
    }

    function onPointerCancel(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        visualElement.getProps().onTapCancel?.(event, info)
    }

    function onPointerStart(event: PointerEvent, info: EventInfo) {
        const latestProps = visualElement.getProps()

        /**
         * Ensure we trigger animations before firing event callback
         */
        if (latestProps.whileTap && visualElement.animationState) {
            visualElement.animationState.setActive(AnimationType.Tap, true)
        }

        latestProps.onTapStart?.(event, info)
    }

    const callbackDependencies = [
        Boolean(onTapStart),
        Boolean(onTap),
        Boolean(whileTap),
        visualElement,
    ]

    const startPress = useCallback((event: PointerEvent, info: EventInfo) => {
        removePointerEndListener()

        if (isPressing.current) return
        isPressing.current = true

        cancelPointerEndListeners.current = pipe(
            addPointerEvent(window, "pointerup", onPointerUp, eventOptions),
            addPointerEvent(
                window,
                "pointercancel",
                onPointerCancel,
                eventOptions
            )
        )

        onPointerStart(event, info)
    }, callbackDependencies)

    usePointerEvent(
        visualElement,
        "pointerdown",
        hasPressListeners ? startPress : undefined,
        eventOptions
    )

    const startAccessiblePress = useCallback(() => {
        const stopKeydownListener = addDomEvent(
            visualElement.current!,
            "keydown",
            (event: KeyboardEvent) => {
                if (event.key !== "Enter" || isPressing.current) return

                isPressing.current = true

                cancelPointerEndListeners.current = addDomEvent(
                    visualElement.current!,
                    "keyup",
                    () => {
                        if (event.key !== "Enter" || !checkPointerEnd()) return

                        fireSyntheticPointerEvent(
                            "up",
                            visualElement.getProps().onTap
                        )
                    },
                    eventOptions
                )

                fireSyntheticPointerEvent("down", onPointerStart)
            }
        )

        const stopBlurListener = addDomEvent(
            visualElement.current!,
            "blur",
            () => {
                stopKeydownListener()
                stopBlurListener()

                if (isPressing.current) {
                    fireSyntheticPointerEvent("cancel", onPointerCancel)
                }
            }
        )
    }, callbackDependencies)

    useDomEvent(
        visualElement,
        "focus",
        hasPressListeners ? startAccessiblePress : undefined
    )

    useUnmountEffect(removePointerEndListener)
}
