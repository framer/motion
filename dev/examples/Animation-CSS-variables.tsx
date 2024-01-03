import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

/**
 * An example of Motion's CSS variable support, including fallback support
 */

let variants = {
    foo: { opacity: [1, 0, 1] },
}

export function App() {
    let [pressed, setPressed] = useState(false)

    let activeVariants = ["foo"]
    if (pressed) {
        activeVariants.push("bar")
    }

    return (
        <div className="p-20">
            <button
                className="rounded border border-gray-300 px-3 py-2"
                onClick={() => setPressed(!pressed)}
            >
                Toggle
            </button>

            <div className="mt-8">
                <p>Active variants: {activeVariants.join(", ")}</p>
            </div>

            <div className="mt-8">
                <motion.div
                    className="box bg-blue"
                    animate={activeVariants}
                    variants={{
                        foo: {
                            opacity: [1, 0, 1],
                        },
                    }}
                    style={{ width: 100, height: 100, background: "blue" }}
                />
                <motion.div
                    className="box bg-green"
                    animate={activeVariants}
                    style={{ width: 100, height: 100, background: "green" }}
                    variants={variants}
                />
            </div>
        </div>
    )
}
