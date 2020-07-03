import * as React from "react"
import { motion } from "@framer"

/**
 * An example of the Motion keyframes syntax.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    x: 0,
    borderRadius: 20,
}

export const App = () => {
    return (
        <motion.div
            animate={{
                width: [null, 50, 200, 100],
            }}
            transition={{
                duration: 2,
                easings: ["circOut", "circOut", "circOut"],
                times: [0, 0.1, 0.9, 1],
            }}
            style={style}
        />
    )
}
