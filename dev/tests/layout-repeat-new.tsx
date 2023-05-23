import { motion } from "framer-motion"
import * as React from "react"
import { useState } from "react"

function range(num: number) {
    return Array.from(Array(num).keys())
}

const sharedMotionProps = {
    layout: true,
    style: { background: "red", width: "100%", height: "100px" },
    transition: {
        duration: 0.25,
        delay: 0.3,
        ease: [0.2, 0.0, 0.83, 0.83],
        layout: { duration: 0.3, ease: [0.2, 0.0, 0.83, 0.83] },
    },
}

export function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <div style={{ height: 50 }}>
                <button id="add" onClick={() => setCount((c) => c + 1)}>
                    Add item
                </button>
                <button id="reset" onClick={() => setCount(0)}>
                    Reset
                </button>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(127px, 1fr))",
                    gridGap: "10px",
                    minHeight: "100px",
                    width: "500px",
                }}
            >
                {range(count)
                    .reverse()
                    .map((i) => (
                        <motion.div
                            id={`box-${i}`}
                            key={i}
                            {...sharedMotionProps}
                        >
                            {i}
                        </motion.div>
                    ))}
            </div>
        </>
    )
}
