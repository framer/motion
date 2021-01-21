import React from "react"
import { motion, useMotionValue } from "@framer"

export function App() {
    const backgroundColor = useMotionValue("#f00")
    return (
        <motion.div initial="initial" animate="to">
            <motion.div>
                <motion.div
                    variants={{
                        initial: {
                            backgroundColor: "#f00",
                        },
                        to: {
                            backgroundColor: "#00f",
                            transition: { type: false },
                        },
                    }}
                    style={{ ...box, backgroundColor }}
                />
            </motion.div>
        </motion.div>
    )
}

const box = {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
}
