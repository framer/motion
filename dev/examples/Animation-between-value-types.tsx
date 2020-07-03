import * as React from "react"
import { motion } from "@framer"

/**
 * An example of animating between the detected value type (px) and the set one (%)
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    return (
        <motion.div
            animate={{ width: "100%" }}
            transition={{ duration: 5, from: "50%" }}
            style={style}
        />
    )
}
