import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}

export const App = () => {
    return <motion.div drag style={styleA} />
}
