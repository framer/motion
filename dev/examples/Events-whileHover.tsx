import * as React from "react"
import { motion } from "@framer"

/**
 * An example of the whileHover and whileTap event animators working together.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    return (
        <motion.div
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.5 }}
            style={style}
        />
    )
}
