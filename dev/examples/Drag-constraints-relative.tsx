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
    const [isDragging, setIsDragging] = useState(false)
    return (
        <motion.div
            drag
            dragElastic
            dragConstraints={{ top: -100, left: -100, right: 300, bottom: 300 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            style={styleA}
        />
    )
}
