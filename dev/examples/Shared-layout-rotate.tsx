import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * This demonstrates the rotation support as setup by Framer's Navigation component
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <AnimatePresence>
            <motion.div
                id="parent"
                layoutId="parent"
                transition={{ duration: 1 }}
                style={smallParent}
                onClick={() => setIsOn(!isOn)}
                key="a"
            >
                <motion.div
                    layoutId="child"
                    transition={{ duration: 1 }}
                    style={smallChild}
                />
            </motion.div>
            {isOn && (
                <motion.div
                    id="parent-2"
                    layoutId="parent"
                    transition={{ duration: 1 }}
                    style={bigParent}
                    onClick={() => setIsOn(!isOn)}
                    key="b"
                >
                    <motion.div
                        layoutId="child"
                        transition={{ duration: 1 }}
                        style={bigChild}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const parent = {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}
const bigParent = {
    ...parent,
    width: 400,
    height: 400,
    borderRadius: 0,
    rotate: 45,
    justifyContent: "flex-start",
    alignItems: "flex-start",
}
const smallParent = {
    ...parent,
    width: 100,
    height: 100,
    borderRadius: 50,
    rotate: 10,
}

const child = {
    backgroundColor: "red",
}
const bigChild = {
    ...child,
    width: 100,
    height: 100,
    borderRadius: 20,
    rotate: 0,
}
const smallChild = {
    ...child,
    width: 50,
    height: 50,
    borderRadius: 0,
    rotate: 45,
}
