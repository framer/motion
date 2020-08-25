import * as React from "react"
import { motion, useDragControls } from "../../src"

/**
 * This is an example of triggering drag from an external element using useDragControls
 */

const container = {
    width: 200,
    height: 200,
    background: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    margin: 20,
}

const child = {
    width: "50vw",
    height: 300,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    const dragControls = useDragControls()

    return (
        <>
            <div style={container} onPointerDown={e => dragControls.start(e)} />
            <motion.div
                drag
                dragControls={dragControls}
                whileTap={{ scale: 0.95 }}
                style={child}
            />
        </>
    )
}
