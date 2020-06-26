import * as React from "react"
import { motion, useCycle } from "@framer"

/**
 * An example of auto animation by setting `animate` to `true`.
 */

export const App = () => {
    const [count, cycleCount] = useCycle(0, 1, 2, 3)

    return (
        <motion.div
            style={{
                ...styles[count],
                position: "absolute",
                backgroundColor: "red",
            }}
            layout
            id={`shape-${count}`}
            onClick={() => cycleCount()}
        />
    )
}

const styles = [
    {
        width: 100,
        height: 100,
        backgroundColor: "#f00",
        top: 100,
    },
    {
        width: 200,
        height: 200,
        backgroundColor: "#fff",
        //opacity: 0.4,
        left: 100,
    },
    {
        width: 100,
        height: 100,
        backgroundColor: "#00f",
        //opacity: 1,
        left: "calc(100vw - 100px)",
    },
    {
        width: 200,
        height: 200,
        backgroundColor: "#0f0",
        //opacity: 1,
        //borderRadius: "100px",
    },
]
