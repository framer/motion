import * as React from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "rgba(255, 0, 0, 1)",
}

export const App = () => {
    return (
        <motion.div
            hoverActive={{ scale: 1.5 }}
            pressActive={{ scale: 0.5, backgroundColor: "rgba(0, 255, 0, .5)" }}
            style={style}
        />
    )
}
