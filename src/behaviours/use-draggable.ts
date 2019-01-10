import { RefObject, useRef, useContext, useMemo } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { PanHandler, usePanGesture, PanInfo } from "../gestures"
import { createLock } from "./utils/lock"
import { MotionContext } from "../motion/utils/MotionContext"

export interface DraggableProps {
    draggable?: boolean | "x" | "y"
}

const dragLock = createLock("drag")

export function useDraggable(props: DraggableProps, ref: RefObject<Element | null>, values: MotionValuesMap) {
    if (!props.draggable) {
        return
    }
    const point = useRef({ x: values.get("x", 0), y: values.get("y", 0) })
    const motionContext = useContext(MotionContext)
    let openLock: (() => void) | false = false

    const onPanStart = useMemo(
        () =>
            function() {
                openLock = dragLock()
                if (!openLock) {
                    return
                }
                motionContext.dragging = true
            },
        [openLock, motionContext]
    )

    const onPan: PanHandler = useMemo(
        () =>
            function({ delta }: PanInfo) {
                if (!openLock) {
                    return
                }
                console.log("pan", point, delta)
                const { x, y } = point.current
                x.set(x.get() + delta.x)
                y.set(y.get() + delta.y)
            },
        [openLock, point]
    )
    const onPanEnd = useMemo(
        () =>
            function() {
                if (openLock) {
                    openLock()
                }
                motionContext.dragging = false
            },
        [openLock, motionContext]
    )

    usePanGesture({ onPanStart, onPan, onPanEnd }, ref)
}
