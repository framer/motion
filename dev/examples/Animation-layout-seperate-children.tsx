import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * An example of auto animation by setting `animate` to `true`.
 */

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)
    const style = isOpen ? open : closed

    return (
        <motion.div
            style={{
                position: "absolute",
                backgroundColor: "white",
                ...style,
            }}
            transition={{
                x: {
                    duration: 0.65,
                    ease: isOpen ? [0.4, 0, 0.1, 1] : [0.4, 0, 0.1, 1],
                },
                y: {
                    delay: isOpen ? 0.1 : 0,
                    duration: isOpen ? 0.55 : 0.25,
                    ease: isOpen ? "easeInOut" : [0.4, 0, 0.1, 1],
                },
            }}
            layout
            onClick={() => setIsOpen(!isOpen)}
        >
            <motion.div layout style={ball} transition={{ duration: 0.5 }} />
        </motion.div>
    )
}

const ball = {
    position: "relative",
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    backgroundColor: "red",
    borderRadius: 25,
}

const open = {
    top: 0,
    right: 0,
    bottom: 0,
    width: 200,
}

const closed = {
    bottom: 20,
    left: 20,
    width: 120,
    height: 40,
}
