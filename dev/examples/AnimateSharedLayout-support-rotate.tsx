import * as React from "react"
import { useState } from "react"
import { motion, AnimateSharedLayout } from "@framer"

/**
 * This demonstrates the rotation support used by Framer
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <AnimateSharedLayout _supportRotate>
            <motion.div
                layout
                initial={false}
                transition={{ duration: 1 }}
                style={isOn ? bigParent : smallParent}
                animate={{
                    rotate: isOn ? 45 : 10,
                    borderRadius: isOn ? 0 : 50,
                }}
                onClick={() => setIsOn(!isOn)}
            >
                <motion.div
                    layout
                    initial={false}
                    transition={{ duration: 1 }}
                    style={isOn ? bigChild : smallChild}
                    animate={{
                        rotate: isOn ? 0 : 45,
                        borderRadius: isOn ? 20 : 0,
                    }}
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
    justifyContent: "flex-start",
    alignItems: "flex-start",
}
const smallParent = {
    ...parent,
    width: 100,
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
    width: 50,
    height: 50,
}
