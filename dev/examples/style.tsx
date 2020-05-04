import * as React from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
    rotate: 45,
}

export const App = () => {
    return (
        <motion.div
            static
            transformTemplate={(_, generated) => {
                console.log("firing template")
                return generated + " translateX(-200px)"
            }}
            style={style}
        />
    )
}
