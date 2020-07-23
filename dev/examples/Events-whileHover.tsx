import * as React from "react"
import { motion } from "@framer"

/**
 * An example of the whileHover and whileTap event animators working together.
 */

const style = {
    width: 100,
    height: 100,
}

export const App = () => {
    return (
        <motion.div
            initial={{ backgroundColor: "hsla(0  25.5%  50% / 1)" }}
            whileHover={{
                scale: 1.5,
                backgroundColor: "hsla(177 37.4978% 76.66804% / 0.5)",
            }}
            whileTap={{ scale: 0.5 }}
            style={style}
        />
    )
}
