import * as React from "react"
import { motion } from "framer-motion"

export const App = () => {
    return (
        <svg
            width="250"
            height="250"
            viewBox="0 0 250 250"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.rect
                x={50}
                y={50}
                width={100}
                height={100}
                transition={{ duration: 3 }}
                style={{ rotate: 45 }}
            />
            <motion.rect
                x={0}
                y={0}
                width={100}
                height={100}
                transition={{ duration: 3 }}
                style={{ rotate: 45 }}
            />
            <motion.rect
                x={100}
                y={100}
                width={100}
                height={100}
                transition={{ duration: 3 }}
                style={{ rotate: 45 }}
            />
        </svg>
    )
}
