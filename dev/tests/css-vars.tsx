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
        <div
            style={
                { "--a": "#00F", "--b": "100px", "--c": 2, "--d": 0.5 } as any
            }
        >
            <motion.div
                animate={{
                    originX: 0,
                    originY: 0,
                    opacity: "var(--d)",
                    backgroundColor: "var(--a)",
                    scale: "var(--c)",
                    x: "var(--b)",
                }}
                transition={{ duration: 0.1 }}
                style={style}
                onUpdate={({ scale }) => {
                    if (isFirstFrame) {
                        content.set(
                            typeof scale === "string" ? "Fail" : "Success"
                        )
                    }
                    isFirstFrame = false
                }}
                id="test"
            >
                {content}
            </motion.div>
        </div>
    )
}
