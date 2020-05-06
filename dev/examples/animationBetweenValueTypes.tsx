import * as React from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    return (
        <motion.div
            animate={{ width: "100%" }}
            transition={{ duration: 5, from: "50%" }}
            style={style}
        />
    )
}
