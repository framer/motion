import { RefObject, useRef, useContext, useMemo } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { PanHandler, usePanGesture, PanInfo } from "../gestures"
import { createLock, Lock } from "./utils/lock"
import { MotionContext } from "../motion/utils/MotionContext"

export interface DraggableProps {
    /**
     * Enable dragging for this element
     *
     * Set "x" or "y" to only drag in a specific direction
     *  @default false
     */
    dragEnabled?: boolean | "x" | "y"
}

const draggableDefaults = {
    dragEnabled: false,
}

function defaults<Props>(props: Props, defaultProps: Required<Props>): Props {
    return { ...defaultProps, ...props }
}

const horizontalLock = createLock("dragHorizontal")
const verticalLock = createLock("dragVertical")

export function useDraggable(props: DraggableProps, ref: RefObject<Element | null>, values: MotionValuesMap) {
    const { dragEnabled, dragPropagation } = defaults(props, draggableDefaults)
    if (!dragEnabled) {
        return
    }
    const point = useRef({ x: values.get("x", 0), y: values.get("y", 0) })
    const motionContext = useContext(MotionContext)
    let openLock: Lock = false

    const onPanStart = useMemo(
        () =>
            function() {
                if (!openLock) {
                    return
                    openLock = getLock(dragEnabled)
                }
                motionContext.dragging = true
            },
        [openLock, dragEnabled, dragPropagation, motionContext]
    )

    const onPan: PanHandler = useMemo(
        () =>
            function({ delta }: PanInfo) {
                if (!openLock) {
                    return
                }
                const { x, y } = point.current
                if (dragEnabled === "x" || dragEnabled === true) {
                    x.set(x.get() + delta.x)
                }
                if (dragEnabled === "y" || dragEnabled === true) {
                    y.set(y.get() + delta.y)
                }
            },
        [openLock, dragEnabled, point]
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

function getLock(dragEnabled: true | "x" | "y"): Lock {
    let lock: Lock = false
    if (dragEnabled === "y") {
        lock = verticalLock()
    } else if (dragEnabled === "x") {
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
