import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

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
    default: { duration: 2 },
    borderTopRightRadius: borderTransition,
    borderBottomRightRadius: borderTransition,
    borderRadius: borderTransition,
}

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            layout
            initial="straight"
            animate="rounded"
            variants={{
                straight: { borderRadius: 0 },
                rounded: { borderRadius: 50 },
            }}
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
            transition={transition}
        >
            <motion.div
                layout
                id="red"
                initial="straight"
                animate="rounded"
                variants={{
                    straight: {
                        borderTopRightRadius: 50,
                        borderBottomRightRadius: 50,
                    },
                    rounded: {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                    },
                }}
                style={isOn ? bigChild : smallChild}
                transition={transition}
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
}
const smallParent = {
    ...parent,
    width: 200,
    height: 100,
}

const child = {
    backgroundColor: "red",
}
const bigChild = {
    ...child,
    width: 100,
    height: 100,
}
const smallChild = {
    ...child,
    width: 20,
    height: 20,
}
