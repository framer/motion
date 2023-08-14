import * as React from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#f00",
    x: 0,
    borderRadius: 20,
    color: "rgba(0,0,0,0)",
}

window.HandoffAppearAnimations = () => 0

export const App = () => {
    return (
        <div style={{ "--a": "#00F", "--b": "360deg", "--c": "100px" } as any}>
            <motion.div animate={{ backgroundColor: "var(--a)" }} style={style}>
                a
            </motion.div>
            <motion.div animate={{ y: 100 }} style={style}>
                a
            </motion.div>
            <svg>
                <motion.circle />
            </svg>
            <motion.div animate={{ opacity: 0.5 }} style={style}>
                a
            </motion.div>
            <motion.div
                animate={{ rotate: "var(--b)", top: "200px" }}
                style={style}
            >
                a
            </motion.div>
            <svg>
                <motion.circle />
            </svg>
            <motion.div animate={{ x: "var(--c)" }} style={style}>
                a
            </motion.div>
        </div>
    )
}
