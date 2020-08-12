import { motion } from "@framer"
import * as React from "react"

// It's important for this test to only trigger a single rerender while dragging (in response to onDragStart) of draggable component.

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const axis = params.get("axis")
    const lock = params.get("lock")
    const top = parseFloat(params.get("top")) || undefined
    const left = parseFloat(params.get("left")) || undefined
    const right = parseFloat(params.get("right")) || undefined
    const bottom = parseFloat(params.get("bottom")) || undefined
    const layout = params.get("layout") || undefined

    return (
        <svg style={{ width: 500, height: 500 }}>
            <motion.circle
                id="box"
                data-testid="draggable"
                drag={axis ? axis : true}
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={{ top, left, right, bottom }}
                dragDirectionLock={!!lock}
                fill="red"
                cx={50}
                cy={50}
                r={20}
                layout={layout}
            />
        </svg>
    )
}
