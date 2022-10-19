import * as React from "react"
import { useEffect, useState } from "react"
import { motion, Timeline } from "framer-motion"

/**
 * An example of the tween transition type
 */

const ball = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: "50%",
}

// console.log(Timeline)

export const App = () => {
    return (
        <div style={{ display: "flex" }}>
            <Timeline
                animate={[
                    ["ball1", { y: [-100, 100, -100] }, { duration: 1 }],
                    [
                        "ball2",
                        { y: [-100, 100, -100] },
                        { duration: 1, at: 0.2 },
                    ],
                    [
                        "ball3",
                        { y: [-100, 100, -100] },
                        { duration: 1, at: 0.4 },
                    ],
                ]}
                transition={{ repeat: Infinity }}
            >
                <motion.div
                    track="ball1"
                    whileHover={{ scale: 2, y: 200 }}
                    style={ball}
                />
                <motion.div track="ball2" style={ball} />
                <motion.div track="ball3" style={ball} />
            </Timeline>
        </div>
    )
}
