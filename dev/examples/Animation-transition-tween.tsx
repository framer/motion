import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [x, setX] = useState(0)
    const transition = {
        type: "spring",
        duration: 0.4,
        dampingRatio: 0.4,
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
