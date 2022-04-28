import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

export function App() {
    const [state, setState] = useState(false)

    return (
        <div
            style={{
                display: "flex",
                width: 300,
                justifyContent: state ? "flex-end" : "flex-start",
            }}
            onClick={() => setState(!state)}
        >
            <motion.svg
                layout
                viewBox="0 0 100 100"
                style={{ flex: "0 0 100px" }}
            >
                <circle cx={50} cy={50} r={50} fill="white" />
            </motion.svg>
        </div>
    )
}
