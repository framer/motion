import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * This demonstrates automatic border radius animations
 * on individual corners, including scale and child scale correction
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            animate
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
            transition={{ duration: 5, ease: "circIn" }}
        >
            <motion.div
                animate
                style={isOn ? bigChild : smallChild}
                transition={{ duration: 5, ease: "circIn" }}
            />
        </motion.div>
    )
}

const parent = {
    backgroundColor: "white",
}
const bigParent = {
    ...parent,
    width: 500,
    height: 500,
    borderRadius: "50%",
}
const smallParent = {
    ...parent,
    width: 200,
    height: 100,
    borderRadius: 100,
    borderTopRightRadius: 50,
}

const child = {
    backgroundColor: "red",
}
const bigChild = {
    ...child,
    width: 200,
    height: 100,
    borderRadius: "50%",
}
const smallChild = {
    ...child,
    width: 20,
    height: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
}
