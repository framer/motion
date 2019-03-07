import * as React from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    x: 0,
}

export const App = () => {
    return (
        <motion.div
            animate={{
                width: [null, 100, 300],
            }}
            style={style}
        />
    )
}
