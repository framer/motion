import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of the Motion keyframes syntax.
 */

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#f00",
    x: 0,
    borderRadius: 20,
    color: "rgba(0,0,0,0)",
}

export const App = () => {
    return (
        <div style={{ "--a": "#00F", "--b": 360, "--c": 100 } as any}>
            <motion.div
                animate={{
                    backgroundColor: "var(--a)",
                    rotateX: "var(--b)",
                    x: "var(--c)",
                    y: "var(--c)",
                }}
                style={style}
                onUpdate={console.log}
            >
                a
            </motion.div>
        </div>
    )
}
