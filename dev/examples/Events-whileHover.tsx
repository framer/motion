import React from "react"
import { motion, useMotionValue } from "framer-motion"

export function App() {
    const scale = useMotionValue(1)

    return (
        <motion.div
            whileHover={{
                scale: 2,
                transition: {
                    type: "spring",
                    mass: 0.5,
                    damping: 10,
                    stiffness: 20,
                    restDelta: 0.00001,
                    restSpeed: 0.00001,
                },
            }}
            style={{ width: 100, height: 100, background: "white", scale }}
        />
    )
}
