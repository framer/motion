import React from "react"
import { motion } from "@framer"

export function App() {
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
                        },
                    }}
                    style={box}
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
