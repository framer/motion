import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState("")

    return (
        <div style={{ position: "relative" }}>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="1"
                        layoutId={"1"}
                        id="open"
                        style={{
                            height: "400px",
                            width: "400px",
                            backgroundColor: "red",
                            position: "absolute",
                            top: "200px",
                            left: "200px",
                        }}
                        transition={{ duration: 0.1 }}
                        onLayoutMeasure={(layout) => {
                            if (layout.x.min !== 200) {
                                setError("Layout measured incorrectly")
                            }
                        }}
                        onClick={() => setIsOpen(false)}
                    ></motion.div>
                )}
            </AnimatePresence>
            <motion.div
                id="target"
                layoutId="1"
                style={{
                    height: "200px",
                    width: "200px",
                    backgroundColor: "blue",
                }}
                transition={{ duration: 0.1 }}
                onClick={() => {
                    setIsOpen(true)
                }}
            />
            <div id="error" style={{ color: "red" }}>
                {error}
            </div>
        </div>
    )
}
