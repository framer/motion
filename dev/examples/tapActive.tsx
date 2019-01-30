import * as React from "react"
import { motion } from "@framer"
import { useAnimation } from "../../src"

const style = {
    width: 100,
    height: 100,
    background: "rgba(255, 0, 0, 1)",
}

export const App = () => {
    return (
        <motion.div
            tapActive={{ scale: 0.5, backgroundColor: "rgba(0, 255, 0, .5)" }}
            style={style}
        />
    )
}
