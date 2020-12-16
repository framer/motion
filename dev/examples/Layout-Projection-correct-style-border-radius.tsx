import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * This demonstrates automatic border radius animations
 * on individual corners, including scale and child scale correction
 */
const borderTransition = {
    duration: 1,
    repeat: Infinity,
    repeatType: "reverse",
}
const transition = {
    default: { duration: 6 },
    borderTopRightRadius: borderTransition,
    borderBottomRightRadius: borderTransition,
    borderRadius: borderTransition,
}

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            layout
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
            transition={transition}
        />
    )
}

const parent = {
    backgroundColor: "white",
}
const bigParent = {
    ...parent,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderBottomRightRadius: "10px",
}
const smallParent = {
    ...parent,
    width: 500,
    height: 100,
    borderRadius: 50,
    borderBottomRightRadius: "10px",
}
