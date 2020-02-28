import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            auto
            transition={{ duration: 10, ease: "linear" }}
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
        >
            <motion.div
                auto
                transition={{ duration: 10, ease: "linear" }}
                style={isOn ? bigChild : smallChild}
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
    borderRadius: 0,
    rotate: 45,
}
const smallParent = {
    ...parent,
    width: 100,
    height: 100,
    borderRadius: 50,
    rotate: 0,
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
