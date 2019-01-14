import * as React from "react"
import { motion, usePanGesture } from "../../src"
import { useState } from "react"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}
const styleB = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const [dragEnabled, setDragEnabled] = useState(true)
    const onTap = () => setDragEnabled(!dragEnabled)
    return (
        <>
            <motion.div dragEnabled={dragEnabled} style={{ ...styleA, background: dragEnabled ? "green" : "yellow" }} />
            <motion.div onTap={onTap} style={styleB} />
        </>
    )
}
