import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const [x, setX] = useState(0)
    const transition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.4,
    }

    return (
        <motion.div
            animate={{ x }}
            transition={transition}
            style={style}
            onTap={() => setX(x + 200)}
        />
    )
}
