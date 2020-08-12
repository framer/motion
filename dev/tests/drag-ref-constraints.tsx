import { motion } from "@framer"
import * as React from "react"

// It's important for this test to only trigger a single rerender while dragging (in response to onDragStart) of draggable component.

export const App = () => {
    const containerRef = React.useRef(null)
    const [dragging, setDragging] = React.useState(false)
    const params = new URLSearchParams(window.location.search)
    const layout = params.get("layout") || undefined

    return (
        <motion.div
            data-testid="constraint"
            style={{ width: 200, height: 200, background: "blue" }}
            ref={containerRef}
        >
            <motion.div
                id="box"
                data-testid="draggable"
                drag
                dragElastic={0}
                dragMomentum={false}
                style={{
                    width: 50,
                    height: 50,
                    background: dragging ? "yellow" : "red",
                }}
                dragConstraints={containerRef}
                layout={layout}
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
            />
        </motion.div>
    )
}
