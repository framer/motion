import {
    EventListenerWithPointInfo,
    extractEventInfo,
} from "../events/event-info"
import { EventInfo } from "../events/types"
import { addDomEvent } from "../events/add-dom-event"
import { addPointerEvent } from "../events/add-pointer-event"
import { Feature } from "../motion/features/Feature"
import { pipe } from "../utils/pipe"
import { isDragActive } from "./drag/utils/lock"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { noop } from "../utils/noop"
import { frame } from "../frameloop"

function fireSyntheticPointerEvent(
    name: string,
    handler?: EventListenerWithPointInfo
) {
    if (!handler) return
    const syntheticPointerEvent = new PointerEvent("pointer" + name)
    handler(syntheticPointerEvent, extractEventInfo(syntheticPointerEvent))
}

export class PressGesture extends Feature<Element> {
    private isPressing: boolean

    private removeStartListeners: Function = noop
    private removeEndListeners: Function = noop
    private removeAccessibleListeners: Function = noop

    private startPress(event: PointerEvent, info: EventInfo) {
        this.isPressing = true

        const { onTapStart, whileTap } = this.node.getProps()

        /**
         * Ensure we trigger animations before firing event callback
         */
        if (whileTap && this.node.animationState) {
            this.node.animationState.setActive("whileTap", true)
        }

        if (onTapStart) {
            frame.postRender(() => onTapStart(event, info))
        }
    }

    private checkPressEnd() {
        this.removeEndListeners()
        this.isPressing = false

        const props = this.node.getProps()

        if (props.whileTap && this.node.animationState) {
            this.node.animationState.setActive("whileTap", false)
        }

        return !isDragActive()
    }

    private startPointerPress = (
        startEvent: PointerEvent,
        startInfo: EventInfo
    ) => {
        if (this.isPressing) return

        this.removeEndListeners()

        const props = this.node.getProps()

        const endPointerPress = (
            endEvent: PointerEvent,
            endInfo: EventInfo
        ) => {
            if (!this.checkPressEnd()) return

            const { onTap, onTapCancel, globalTapTarget } = this.node.getProps()

            /**
             * We only count this as a tap gesture if the event.target is the same
             * as, or a child of, this component's element
             */
            const handler =
                !globalTapTarget &&
                !isNodeOrChild(this.node.current, endEvent.target as Element)
                    ? onTapCancel
                    : onTap

            if (handler) {
                frame.update(() => handler(endEvent, endInfo))
            }
        }

        const removePointerUpListener = addPointerEvent(
            window,
            "pointerup",
            endPointerPress,
            {
                passive: !(
                    props.onTap || props["onPointerUp" as keyof typeof props]
                ),
            }
        )

        const removePointerCancelListener = addPointerEvent(
            window,
            "pointercancel",
            (cancelEvent, cancelInfo) =>
                this.cancelPress(cancelEvent, cancelInfo),
            {
                passive: !(
                    props.onTapCancel ||
                    props["onPointerCancel" as keyof typeof props]
                ),
            }
        )

        this.removeEndListeners = pipe(
            removePointerUpListener,
            removePointerCancelListener
        )

        this.startPress(startEvent, startInfo)
    }

    private cancelPress(event: PointerEvent, info: EventInfo) {
        if (!this.checkPressEnd()) return

        const { onTapCancel } = this.node.getProps()
        if (onTapCancel) {
            frame.postRender(() => onTapCancel(event, info))
        }
    }

    private startAccessiblePress = () => {
        const handleKeydown = (keydownEvent: KeyboardEvent) => {
            if (keydownEvent.key !== "Enter" || this.isPressing) return

            const handleKeyup = (keyupEvent: KeyboardEvent) => {
                if (keyupEvent.key !== "Enter" || !this.checkPressEnd()) return

                fireSyntheticPointerEvent("up", (event, info) => {
                    const { onTap } = this.node.getProps()
                    if (onTap) {
                        frame.postRender(() => onTap(event, info))
                    }
                })
            }

            this.removeEndListeners()
            this.removeEndListeners = addDomEvent(
                this.node.current!,
                "keyup",
                handleKeyup
            )

            fireSyntheticPointerEvent("down", (event, info) => {
                this.startPress(event, info)
            })
        }

        const removeKeydownListener = addDomEvent(
            this.node.current!,
            "keydown",
            handleKeydown
        )

        const handleBlur = () => {
            if (!this.isPressing) return

            fireSyntheticPointerEvent("cancel", (cancelEvent, cancelInfo) =>
                this.cancelPress(cancelEvent, cancelInfo)
            )
        }

        const removeBlurListener = addDomEvent(
            this.node.current!,
            "blur",
            handleBlur
        )

        this.removeAccessibleListeners = pipe(
            removeKeydownListener,
            removeBlurListener
        )
    }

    mount() {
        const props = this.node.getProps()

        const removePointerListener = addPointerEvent(
            props.globalTapTarget ? window : this.node.current!,
            "pointerdown",
            this.startPointerPress,
            {
                passive: !(
                    props.onTapStart ||
                    props["onPointerStart" as keyof typeof props]
                ),
            }
        )

        const removeFocusListener = addDomEvent(
            this.node.current!,
            "focus",
            this.startAccessiblePress
        )

        this.removeStartListeners = pipe(
            removePointerListener,
            removeFocusListener
        )
    }

    unmount() {
        this.removeStartListeners()
        this.removeEndListeners()
        this.removeAccessibleListeners()
    }
}
