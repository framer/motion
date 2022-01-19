import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of using whileHover to convert between different value types
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

const container = {
    hidden: { width: 10 },
    visible: {
        width: "100%",
    },
}

export const App = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileFocus="visible"
            style={style}
        />
    )
}
