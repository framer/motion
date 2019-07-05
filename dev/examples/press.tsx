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
            initial={{ scale: 1 }}
            whileTap={{ scale: 2 }}
            style={style}
        />
    )
}
