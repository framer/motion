import * as React from "react"
import { motion, useCycle, AnimatePresence } from "@framer"

/**
 * An example of a component resuming animation and layout state using Shared layout and layoutId
 */
function Component() {
    const [count, cycleCount] = useCycle(0, 1, 2, 3)

    return (
        <AnimatePresence>
            <motion.div
                initial={false}
                style={{
                    position: "absolute",
                    ...styles[count],
                }}
                transition={{ duration: 3 }}
                animate={animate[count]}
                layoutId="box"
                id={`shape-${count}`}
                key={`shape-${count}`}
                onClick={() => cycleCount()}
            />
        </AnimatePresence>
    )
}

export const App = () => {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Component />
        </div>
    )
}

const animate = [
    {
        backgroundColor: "#09f",
        borderRadius: 10,
        opacity: 1,
    },
    {
        backgroundColor: "#90f",
        borderRadius: 100,
        opacity: 0.5,
    },
    {
        backgroundColor: "#f09",
        borderRadius: 0,
        opacity: 1,
    },
    {
        backgroundColor: "#9f0",
        borderRadius: 50,
        opacity: 0.5,
    },
]

const styles = [
    {
        width: 100,
        height: 100,
        top: 100,
    },
    {
        width: 200,
        height: 200,
        left: 100,
    },
    {
        width: 100,
        height: 100,
        left: "calc(100vw - 100px)",
    },
    {
        width: 200,
        height: 200,
    },
]
