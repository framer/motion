import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <div style={container} onClick={() => setIsOn(!isOn)}>
            <motion.div
                animate
                style={isOn ? smallParent : bigParent}
                id="parent"
                transition={{ duration: 2 }}
            >
                <motion.div
                    animate
                    id="child"
                    style={isOn ? bigChild : smallChild}
                    transition={{ duration: 2 }}
                />
            </motion.div>
        </div>
    )
}

const container = {
    display: "flex",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
}

const parent = {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
}

const smallParent = { ...parent, width: 200, height: 0 }

const bigParent = { ...parent, width: 300, height: 300 }

const child = {
    backgroundColor: "red",
    borderRadius: 20,
}

const smallChild = { ...child, width: 50, height: 50 }

const bigChild = { ...child, width: 150, height: 150 }
