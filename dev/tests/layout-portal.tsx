import { motion } from "framer-motion"
import { useState } from "react"
import { createPortal } from "react-dom"

export const App = () => {
    const [count, setCount] = useState(0)

    const size = count === 0 ? 100 : 300

    return (
        <motion.div
            id="parent"
            layout
            style={{
                background: "red",
                width: size,
                height: size,
            }}
            onClick={() => setCount(count + 1)}
            transition={{ duration: 10, ease: () => 0.5 }}
        >
            {createPortal(
                <motion.div
                    id="child"
                    layout
                    style={{ width: 100, height: 100, background: "blue" }}
                    transition={{ duration: 10, ease: () => 0.5 }}
                    data-framer-portal-id="parent"
                />,
                document.body
            )}
        </motion.div>
    )
}
