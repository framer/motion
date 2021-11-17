import * as React from "react"
import { motion, useCycle } from "@framer"

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
    const [animate, cycle] = useCycle("a", "b")
    return (
        <motion.div
            initial={false}
            animate={animate}
            variants={{
                a: { x: [0, 200] },
                b: { x: [0, 200] },
            }}
            onClick={() => cycle()}
            transition={{
                duration: 2,
                easings: ["circOut", "circOut", "circOut"],
                times: [0, 0.1, 0.9, 1],
            }}
            style={style}
        />
    )
}
