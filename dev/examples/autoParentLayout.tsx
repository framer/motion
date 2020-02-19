import * as React from "react"
import { useState } from "react"
import { motion, useCycle } from "@framer"

/**
 * This example demonstrates that nested components automatically factor in parent deltas
 *
 * TODO: Demonstrate size as well as position
 */
const transition = { duration: 3, ease: "circIn" }

export const App = () => {
    const [{ top, alignItems }, cycleTop] = useCycle(
        { top: "50%", alignItems: "flex-start" },
        { top: 10, alignItems: "flex-end" }
    )

    return (
        <motion.div
            layoutTransition
            style={{ ...styles.parent, alignItems, top }}
            onClick={() => cycleTop()}
        >
            <motion.div
                layoutTransition
                style={{ ...styles.child, backgroundColor: "blue", alignItems }}
            >
                <motion.div
                    layoutTransition
                    style={{ ...styles.child, height: "30%" }}
                />
            </motion.div>
        </motion.div>
    )
}

const styles = {
    parent: {
        position: "absolute",
        left: "50%",
        width: 120,
        height: 120,
        backgroundColor: "white",
        padding: 10,
        display: "flex",
        justifyContent: "stretch",
        alignItems: "stretch",
    },
    child: {
        backgroundColor: "red",
        flex: 1,
        padding: 10,
        display: "flex",
        justifyContent: "stretch",
        alignItems: "stretch",
        height: "50%",
    },
}
