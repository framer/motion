import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}
export const App = () => {
    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 400 }}
            style={styleA}
        />
    )
}
