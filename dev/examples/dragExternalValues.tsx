import * as React from "react"
import { motion, useMotionValue } from "../../src"

const style = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}

export const App = () => {
    const x = useMotionValue(0)
    return (
        <motion.div style={{ x }}>
            <motion.div
                drag="x"
                dragValueX={x}
                dragConstraints={{ left: -100, right: 100 }}
                style={style}
            />
            <motion.div
                drag="x"
                dragValueX={x}
                dragConstraints={{ left: -100, right: 100 }}
                style={style}
            />
        </motion.div>
    )
}
