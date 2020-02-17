import * as React from "react"
import { motion, useCycle } from "@framer"

const styles = [
    {
        width: 100,
        height: 100,
        background: "#f00",
        opacity: 1,
        top: 100,
    },
    {
        width: 200,
        height: 200,
        background: "#fff",
        opacity: 0.4,
        left: 100,
    },
    {
        width: 100,
        height: 100,
        background: "#00f",
        opacity: 1,
        left: "calc(100vw - 100px)",
    },
    {
        width: 200,
        height: 200,
        background: "#0f0",
        opacity: 1,
        borderRadius: "100px",
    },
]

/**
 * Issues:
 * - Nested stuff
 * - Animating between borderRadius value type
 */

export const App = () => {
    const [count, cycleCount] = useCycle(0, 1, 2, 3)
    return (
        <motion.div
            style={{ ...styles[count], position: "absolute" }}
            layoutTransition
            onClick={() => cycleCount()}
            layoutId="test"
            key={count}
        />
    )
}
