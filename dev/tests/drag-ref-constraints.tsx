import { motion, useMotionValue } from "@framer"
import * as React from "react"

// It's important for this test to only trigger a single rerender while dragging (in response to onDragStart) of draggable component.

export const App = () => {
    const containerRef = React.useRef(null)
    const [dragging, setDragging] = React.useState(false)
    const params = new URLSearchParams(window.location.search)
    const layout = params.get("layout") || undefined

    // We do this to test when scroll position isn't 0/0
    React.useLayoutEffect(() => {
        window.scrollTo(0, 100)
    }, [])
    const x = useMotionValue("100%")
    return (
        <div style={{ height: 2000, paddingTop: 100 }}>
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
                        x,
                    }}
                    dragConstraints={containerRef}
                    layout={layout}
                    onDragStart={() => setDragging(true)}
                    onDragEnd={() => setDragging(false)}
                />
            </motion.div>
        </div>
    )
}
