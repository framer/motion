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
    const [count, setCount] = useState(0)
    const transition = {
        type: "spring",
        duration: 0.4,
        dampingRatio: 0.4,
    }

    return (
        <motion.div
            initial={false}
            animate={count === 0 || count % 3 ? { x: count * 100 } : undefined}
            whileHover={{ x: 100, opacity: 0.5 }}
            transition={transition}
            style={style}
            onTap={() => setCount(count + 1)}
        />
    )
}
