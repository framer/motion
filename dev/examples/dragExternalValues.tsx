import * as React from "react"
import { motion, useMotionValue, useAnimation } from "../../src"

const style = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}

export const App = () => {
    const x = useMotionValue(0)
    const controls = useAnimation()

    return (
        <motion.div style={{ x }} animate={controls}>
            <motion.div
                drag="x"
                _dragValueX={x}
                _dragTransitionControls={controls}
                dragConstraints={{ left: -100, right: 100 }}
                style={style}
            />
            <motion.div
                drag="x"
                _dragValueX={x}
                _dragTransitionControls={controls}
                dragConstraints={{ left: -100, right: 100 }}
                style={style}
            />
        </motion.div>
    )
}
