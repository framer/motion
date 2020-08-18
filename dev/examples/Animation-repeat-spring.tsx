import * as React from "react"
import { motion } from "@framer"

/**
 * An example of the Motion keyframes syntax.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    x: 0,
    borderRadius: 20,
}

export const App = () => {
    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 300 }}
            transition={{
                type: "spring",
                delay: 1,
                repeat: 2,
                repeatDelay: 1,
                repeatType: "reverse",
            }}
            style={style}
        />
    )
}
