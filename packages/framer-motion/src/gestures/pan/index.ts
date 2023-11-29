import { PanInfo, PanSession } from "./PanSession"
import { addPointerEvent } from "../../events/add-pointer-event"
import { Feature } from "../../motion/features/Feature"
import { noop } from "../../utils/noop"
import { frame } from "../../frameloop"
import { getContextWindow } from "../../utils/get-context-window"

type PanEventHandler = (event: PointerEvent, info: PanInfo) => void
const asyncHandler =
    (handler?: PanEventHandler) => (event: PointerEvent, info: PanInfo) => {
        if (handler) {
            frame.update(() => handler(event, info))
        }
    }

export class PanGesture extends Feature<Element> {
    private session?: PanSession

    private removePointerDownListener: Function = noop

    onPointerDown(pointerDownEvent: PointerEvent) {
        this.session = new PanSession(
            pointerDownEvent,
            this.createPanHandlers(),
            {
                transformPagePoint: this.node.getTransformPagePoint(),
                contextWindow: getContextWindow(this.node),
            }
        )
    }

    createPanHandlers() {
        const { onPanSessionStart, onPanStart, onPan, onPanEnd } =
            this.node.getProps()

        return {
            onSessionStart: asyncHandler(onPanSessionStart),
            onStart: asyncHandler(onPanStart),
            onMove: onPan,
            onEnd: (event: PointerEvent, info: PanInfo) => {
                delete this.session
                if (onPanEnd) {
                    frame.update(() => onPanEnd(event, info))
                }
            },
        }
    }

    mount() {
        this.removePointerDownListener = addPointerEvent(
            this.node.current!,
            "pointerdown",
            (event: PointerEvent) => this.onPointerDown(event)
        )
    }

    update() {
        this.session && this.session.updateHandlers(this.createPanHandlers())
    }

    unmount() {
        this.removePointerDownListener()
        this.session && this.session.end()
    }
}
