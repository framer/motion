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
            onPanSessionStart={() => console.log("session start")}
            onPanStart={() => console.log("pan start")}
            onPan={() => console.log("pan")}
            onPanEnd={() => console.log("pan end")}
            style={styleA}
        />
    )
}
