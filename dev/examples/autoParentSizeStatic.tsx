import * as React from "react"
import { motion, useCycle } from "@framer"

/**
 * This example demonstrates that nested components automatically factor in parent size deltas
 */
const transition = { duration: 3, ease: "circIn" }

export const App = () => {
    const [isOpen, toggleIsOpen] = useCycle(false, true)

    return (
        <motion.div
            layoutTransition={transition}
            style={isOpen ? openParent : closedParent}
            onClick={() => toggleIsOpen()}
        >
            <motion.div layoutTransition={transition} style={child}>
                {/* <motion.div
                    layoutTransition
                    style={{ ...styles.child, height: "30%" }}
                /> */}
            </motion.div>
        </motion.div>
    )
}

const parent = {
    position: "absolute",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

const openParent = {
    ...parent,
    width: 600,
    height: 600,
    left: "calc(50% - 300px)",
    top: "calc(50% - 300px)",
}

const closedParent = {
    ...parent,
    width: 200,
    height: 200,
    left: "calc(50% - 100px)",
    top: "calc(50% - 100px)",
}

const child = {
    width: 150,
    height: 150,
    backgroundColor: "blue",
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
