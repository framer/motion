import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    return (
        <motion.div
            drag
            dragElastic
            dragConstraints={{ top: -100, left: -100, right: 300, bottom: 300 }}
            whilePress={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            style={styleA}
        />
    )
}
