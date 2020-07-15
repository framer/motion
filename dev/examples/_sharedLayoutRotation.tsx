import * as React from "react"
import { useState } from "react"
import { motion, AnimateSharedLayout } from "@framer"

/**
 * This demonstrates the rotation support used by Framer
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <AnimateSharedLayout supportRotate>
            <motion.div
                layout
                transition={{ duration: 1 }}
                style={isOn ? bigParent : smallParent}
                onClick={() => setIsOn(!isOn)}
            >
                <motion.div
                    layout
                    transition={{ duration: 1 }}
                    style={isOn ? bigChild : smallChild}
                />
            </motion.div>
        </AnimateSharedLayout>
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
