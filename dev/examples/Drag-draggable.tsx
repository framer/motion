import * as React from "react"
import { useState } from "react"
import { motion } from "../../src"

const styleA = {
    width: 200,
    height: 200,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    const [isTap, setTap] = useState(false)
    const [isDrag, setDrag] = useState(false)
    const [dragCount, setDragCount] = useState(0)
    const handleTap = () => setTap(true)
    const handleTapStart = () => setTap(true)
    const handleTapCancel = () => setTap(false)
    const handleDrag = () => setDragCount(dragCount + 1)
    const handleDragEnd = () => setDrag(false)
    const handleDragStart = () => setDrag(true)

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            whileTap={{ scale: 0.95 }}
            onTap={handleTap}
            onTapStart={handleTapStart}
            onTapCancel={handleTapCancel}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={styleA}
        />
    )
}
