import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of animating between different value types
 */

export const App = () => {
    return (
        <motion.div
            animate={{ height: "50vh", width: 100 }}
            transition={{ duration: 5, ease: () => 0.5 }}
            style={{ width: "50vw", height: 100, background: "#ffaa00" }}
            id="box"
        />
    )
}
