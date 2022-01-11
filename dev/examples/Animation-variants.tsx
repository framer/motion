import React from "react"
import { motion, useMotionValue } from "framer-motion"

export function App() {
    const backgroundColor = useMotionValue("#f00")
    const [isActive, setIsActive] = React.useState(true)
    return (
        <motion.div
            initial="initial"
            animate={isActive ? "to" : "initial"}
            onClick={() => setIsActive(!isActive)}
        >
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
