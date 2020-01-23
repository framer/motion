import * as React from "react"
import { motion, useDragControls } from "../../src"

export const App = () => {
    const dragControls = useDragControls()

    return (
        <div style={container}>
            <div
                style={scrubber}
                onMouseDown={e => dragControls.start(e, { snapToCursor: true })}
            />
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 170 }}
                dragControls={dragControls}
                style={{ ...handle, x: 100 }}
            />
        </div>
    )
}

const container: React.CSSProperties = {
    width: 200,
    height: 30,
    position: "relative",
}

const scrubber: React.CSSProperties = {
    width: 200,
    height: 6,
    borderRadius: 15,
    position: "absolute",
    top: 12,
    background: "white",
}

const handle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    position: "absolute",
    top: 0,
    background: "red",
}
