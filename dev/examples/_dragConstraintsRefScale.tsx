import * as React from "react"
import { useRef } from "react"
import { motion, MotionConfig } from "../../src"

const dragContainer = {
    width: "50%",
    height: "60vh",
    background: "#F30552",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    transform: "scale(1.2)",
}

const draggable = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: "10px",
}
export const App = () => {
    const ref = useRef(null)

    return (
        <MotionConfig
            transformPagePoint={({ x, y }) => ({
                x: x / 1.2,
                y: y / 1.2,
            })}
        >
            <motion.div ref={ref} style={dragContainer}>
                <motion.div
                    drag
                    dragConstraints={ref}
                    dragElastic={0.2}
                    style={draggable}
                />
            </motion.div>
        </MotionConfig>
    )
}
