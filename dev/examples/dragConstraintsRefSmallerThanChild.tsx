import * as React from "react"
import { useRef } from "react"
import { motion } from "../../src"

const dragContainer = {
    width: "400px",
    height: "100px",
    background: "#F30552",
    borderRadius: "10px",
}

const draggable = {
    width: 1000,
    height: 100,
    background: "white",
    borderRadius: "10px",
    opacity: 0.5,
}
export const App = () => {
    const ref = useRef(null)

    return (
        <motion.div ref={ref} style={dragContainer}>
            <motion.div
                drag="x"
                dragConstraints={ref}
                dragElastic={0.2}
                style={draggable}
            />
        </motion.div>
    )
}
