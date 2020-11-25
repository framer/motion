import * as React from "react"
import { useRef, useState } from "react"
import { motion, useAnimation } from "@framer"
import { useMotionValue } from "../../src"

/**
 * An example of whileTap propagating through components.
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const scale = useMotionValue(0.5)
    return (
        <motion.div whileTap="pressed">
            <motion.div
                data-testid="child"
                variants={{ pressed: { scale: 1 } }}
                style={{ scale, ...style }}
            />
        </motion.div>
    )
}
