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
            style={{
                display: "flex",
                width: 500,
                justifyContent: isBig ? "flex-end" : "flex-start",
            }}
            onClick={() => setBig(!isBig)}
        >
            <Timeline
                animate={[["ball1", { scale: [1, 1.5, 1] }, { duration: 1 }]]}
                transition={{ repeat: Infinity }}
            >
                <motion.div
                    track="ball1"
                    // key={isBig ? "a" : "b"}
                    whileHover={{ scale: 2 }}
                    style={ball}
                    layoutId="ball"
                />
            </Timeline>
        </div>
    )
}
