import * as React from "react"
import { motion } from "@framer"
import { useAnimation } from "../../src"

const style = {
    width: 100,
    height: 100,
    background: "rgba(255, 0, 0, 1)",
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
            whileHover="visible"
            style={style}
        />
    )
}
