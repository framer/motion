import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * An example of the onTap event
 */

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const [x, setX] = useState(0)
    return (
        <motion.div animate={{ x }} style={style} onTap={() => setX(x + 45)} />
    )
}
