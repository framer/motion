import * as React from "react"
import { motion } from "@framer"

/**
 * An example of using the style prop with special Motion shorthands like x and rotate
 */

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
    rotate: 45,
}

export const App = () => {
    return (
        <motion.div static>
            <motion.div
                transformTemplate={(_, generated) => {
                    console.log("firing template")
                    return generated + " translateX(-200px)"
                }}
                variants={{ show: { backgroundColor: "green", x: 10 } }}
                initial="show"
                style={style}
            />
        </motion.div>
    )
}
