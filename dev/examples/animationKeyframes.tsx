import * as React from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    x: 0,
}

export const App = () => {
    const transition = {
        backgroundColor: {
            type: "keyframes",
            values: ["#0f0", "#f00", "#00f"],
            duration: 2,
        },
    }

    return (
        <motion.div
            animate={{ backgroundColor: "#00f" }}
            transition={transition}
            style={style}
        />
    )
}
