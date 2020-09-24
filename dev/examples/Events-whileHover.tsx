import React from "react"
import { motion } from "@framer"

export function App() {
    return (
        <motion.div
            whileTap={{ scale: 0.5 }}
            whileHover={{
                scale: 1.5,
                transition: {
                    type: "spring", //uncomment out to work
                    mass: 0.5,
                    damping: 10,
                    stiffness: 20,
                },
            }}
            style={{ width: 100, height: 100, background: "white" }}
        />
    )
}
