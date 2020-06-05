import * as React from "react"
import { useState } from "react"
import { motion, useMotionValue } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [is, setIs] = useState(false)
    const x = useMotionValue(100)

    const motionStyle = is
        ? { x, y: 10, backgroundColor: "red" }
        : { x: -100, y: 50, backgroundColor: "green" }

    return (
        <motion.div
            onClick={() => setIs(!is)}
            style={{ ...style, ...motionStyle }}
        />
    )
}
