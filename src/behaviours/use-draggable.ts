import { RefObject, useRef, useContext, useMemo } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { PanHandler, usePanGesture, PanInfo } from "../gestures"
import { createLock, Lock } from "./utils/lock"
import { MotionContext } from "../motion/utils/MotionContext"

export interface DraggableProps {
    draggable?: boolean | "x" | "y"
}

const horizontalLock = createLock("dragHorizontal")
const verticalLock = createLock("dragVertical")

export function useDraggable(props: DraggableProps, ref: RefObject<Element | null>, values: MotionValuesMap) {
    const { draggable } = props
    if (!draggable) {
        return
    }
    const point = useRef({ x: values.get("x", 0), y: values.get("y", 0) })
    const motionContext = useContext(MotionContext)
    let openLock: Lock = false

    const onPanStart = useMemo(
        () =>
            function() {
                openLock = getLock(draggable)
                if (!openLock) {
                    return
                }
                motionContext.dragging = true
            },
        [openLock, draggable, motionContext]
    )

    const onPan: PanHandler = useMemo(
        () =>
            function({ delta }: PanInfo) {
                if (!openLock) {
                    return
                }
                const { x, y } = point.current
                if (props.draggable === "x" || props.draggable === true) {
                    x.set(x.get() + delta.x)
                }
                if (props.draggable === "y" || props.draggable === true) {
                    y.set(y.get() + delta.y)
                }
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

function getLock(draggable: true | "x" | "y"): Lock {
    let lock: Lock = false
    if (draggable === "y") {
        lock = verticalLock()
    } else if (draggable === "x") {
        lock = horizontalLock()
    } else {
        const openHorizontal = horizontalLock()
        const openVertical = verticalLock()
        if (openHorizontal && openVertical) {
            lock = () => {
                openHorizontal()
                openVertical()
            }
        }
    }
    return lock
}
