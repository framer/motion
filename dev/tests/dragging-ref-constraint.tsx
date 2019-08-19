import { motion } from "@framer"
import * as React from "react"

// It's important for this test to only trigger a single rerender while dragging (in response to onDragStart) of draggable component.

export const App = () => {
    const containerRef = React.useRef(null)

    return (
        <motion.div
            data-testid="constraint"
            style={{ width: 200, height: 200, background: "blue" }}
            ref={containerRef}
        >
            <motion.div
                data-testid="draggable"
                drag
                dragElastic={false}
                dragMomentum={false}
                style={{
                    width: 50,
                    height: 50,
                    background: "red",
                }}
                dragConstraints={containerRef}
            />
        </motion.div>
    )
}
