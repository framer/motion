import { motion } from "@framer"
import * as React from "react"
import { useState } from "react"

/**
 * This example checks that the targetBox is correctly adjusted for changes in scroll.
 *
 * Click the blue button to force a re-render.
 *
 * Drag the red box (position static) and the green box (position fixed).
 * Scroll. Click the blue button. Both boxes should stay in the correct place.
 *
 * TODO: automate this test
 */

export const App = () => {
    const [count, setCount] = useState(0)
    const forceRender = () => setCount(count + 1)

    return (
        <div
            style={{
                height: "2000vh",
                background: "linear-gradient(#fff, #000)",
            }}
        >
            <motion.div
                drag
                style={{ width: 100, height: 100, background: "red" }}
            />
            <motion.div
                layout
                style={{
                    width: 100,
                    height: 100,
                    position: "relative",
                    left: count * 10,
                    background: "purple",
                }}
            />
            <motion.div
                drag
                style={{
                    width: 100,
                    height: 100,
                    background: "green",
                    position: "fixed",
                }}
            />
            <div
                style={{
                    position: "fixed",
                    bottom: 10,
                    left: 10,
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    background: "blue",
                }}
                onClick={forceRender}
            />
        </div>
    )
}
