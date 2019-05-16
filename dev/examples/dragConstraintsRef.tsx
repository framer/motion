import * as React from "react"
import { useRef } from "react"
import { motion } from "../../src"

const dragContainer = {
    width: "50%",
    height: 400,
    background: "blue",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}

const draggable = {
    width: 100,
    height: 100,
    background: "red",
    borderRadius: "10px",
}
export const App = () => {
    const ref = useRef(null)

    return (
        <motion.div ref={ref} style={dragContainer}>
            <motion.div
                drag
                dragConstraints={ref}
                dragElastic={0}
                style={draggable}
            />
        </motion.div>
    )
}
