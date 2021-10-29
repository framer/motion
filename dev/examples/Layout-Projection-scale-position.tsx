import React from "react"
import { useState } from "react"
import { motion } from "@framer"

const textA = `
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
`

const textB = `
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
`

export function App() {
    const [c, setC] = useState(1)

    return (
        <motion.div
            layout
            id="parent"
            transition={transition}
            onClick={() => setC((i) => -1 * i)}
            style={{
                backgroundColor: "#fff",
                padding: 40,
                overflow: "hidden",
                maxWidth: 500,
            }}
        >
            <motion.div
                layout="position"
                id="child"
                transition={transition}
                style={{ backgroundColor: "#ccc" }}
            >
                {c === 1 ? textA : textB}
            </motion.div>
        </motion.div>
    )
}

const transition = {
    duration: 3,
}
