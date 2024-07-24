import { useState } from "react"
import { motion } from "framer-motion"

/**
 * This demonstrates the skew support with layout animations
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            layout
            id="parent"
            initial={false}
            transition={{ duration: 1 }}
            style={isOn ? bigParent : smallParent}
            animate={{
                skewX: isOn ? 45 : 10,
                borderRadius: isOn ? 0 : 50,
            }}
            onClick={() => setIsOn(!isOn)}
        >
            <motion.div
                layout
                id="child"
                initial={false}
                transition={{ duration: 1 }}
                style={isOn ? bigChild : smallChild}
                animate={{
                    skewX: isOn ? 0 : 45,
                    borderRadius: isOn ? 20 : 0,
                }}
            />
        </motion.div>
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
