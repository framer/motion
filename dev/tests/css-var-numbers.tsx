import * as React from "react"
import { motion, useMotionValue } from "framer-motion"

/**
 * An example of the Motion keyframes syntax.
 */

const style = {
    width: 100,
    height: 100,
    backgroundColor: "#f00",
    x: 0,
    borderRadius: 20,
}
let isFirstFrame = true
export const App = () => {
    const content = useMotionValue("")

    return (
        <div style={{ "--a": "#00F", "--b": "360deg", "--c": 2 } as any}>
            <motion.div
                animate={{
                    originX: 0,
                    originY: 0,
                    backgroundColor: "var(--a)",
                    scale: "var(--c)",
                }}
                style={style}
                onUpdate={({ scale }) => {
                    if (isFirstFrame) {
                        content.set(scale === "2" ? "Fail" : "Success")
                    }
                    isFirstFrame = false
                }}
            >
                {content}
            </motion.div>
        </div>
    )
}
