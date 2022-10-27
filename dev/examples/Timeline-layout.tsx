import * as React from "react"
import { useEffect, useState } from "react"
import { motion, Timeline, useMotionValue } from "framer-motion"

/**
 * An example of the tween transition type
 */

// console.log(Timeline)

export const App = () => {
    const [isBig, setBig] = useState(false)

    const ball = {
        width: isBig ? 200 : 100,
        height: isBig ? 200 : 100,
        background: "white",
        borderRadius: "50%",
    }
    return (
        <div
            style={{ display: "flex", gap: isBig ? 200 : 100 }}
            onClick={() => setBig(!isBig)}
        >
            <Timeline
                animate={[
                    ["ball1", { scale: [1, 2, 1] }, { duration: 1 }],
                    ["ball2", { scale: [1, 2, 1] }, { duration: 1, at: 0.2 }],
                    ["ball3", { scale: [1, 2, 1] }, { duration: 1, at: 0.4 }],
                ]}
                transition={{ repeat: Infinity }}
            >
                <motion.div track="ball1" style={ball} layout />
                <motion.div track="ball2" style={ball} layout />
                <motion.div track="ball3" style={ball} layout />
            </Timeline>
        </div>
    )
}
