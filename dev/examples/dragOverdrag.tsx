import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}
export const App = () => {
    return (
        <motion.div
            dragEnabled
            dragConstraints={{ left: -100, bottom: 100, top: -100, right: 100 }}
            dragElastic
            dragMomentum
            style={styleA}
        />
    )
}
