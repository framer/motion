import * as React from "react"
import { motion } from "@framer"
import { useAnimation } from "../../src"

const style = {
    width: 100,
    height: 100,
    background: "rgba(255, 0, 0, 1)",
}

export const App = () => {
    const animation = useAnimationControls()
    return (
        <motion.div
            animate={animation}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.5, backgroundColor: "rgba(0, 255, 0, .5)" }}
            onHoverStart={() => {
                animation.start({ background: "#00F" })
            }}
            onHoverEnd={() => {
                animation.start({ background: "#F00" })
            }}
            style={style}
        />
    )
}
