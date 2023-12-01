import React from "react"
import { motion } from "framer-motion"

export function App() {
    const [scale, setScale] = React.useState(2)
    return (
        <motion.div
            whileHover={{
                opacity: 0.5,
                transition: {
                    type: "spring",
                    mass: 0.5,
                    damping: 10,
                    stiffness: 20,
                    restDelta: 0.00001,
                    restSpeed: 0.00001,
                },
            }}
            onClick={() => setScale(scale + 1)}
            style={{ width: 100, height: 100, background: "white" }}
        />
    )
}
