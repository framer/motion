import * as React from "react"
import { motion, MotionConfig } from "@framer"

/**
 * An example of a motion tree set to static mode, like on the Framer canvas
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    x: 30,
    borderRadius: 20,
}

export const App = () => {
    return (
        <MotionConfig isStatic>
            <motion.div
                animate={{
                    width: [null, 50, 200, 100],
                }}
                transition={{
                    duration: 2,
                    easings: ["circOut", "circOut", "circOut"],
                    times: [0, 0.1, 0.9, 1],
                }}
                style={style}
            />
        </MotionConfig>
    )
}
