import * as React from "react"
import { motion } from "@framer"

/**
 * An example of animating the filter property.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    opacity: 1,
    // filter: "brightness(100%)",
}

export const App = () => {
    return (
        <motion.div
            animate={{ filter: "brightness(0.5)" }}
            transition={{ duration: 2 }}
            style={style}
        />
    )
}
