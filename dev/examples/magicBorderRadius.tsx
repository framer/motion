import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            magic
            style={isOn ? bigParent : smallParent}
            onClick={() => setIsOn(!isOn)}
            transition={{ duration: 2 }}
        >
            <motion.div
                magic
                style={isOn ? bigChild : smallChild}
                transition={{ duration: 2 }}
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
    borderRadius: 100,
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
    width: 100,
    height: 100,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
}
const smallChild = {
    ...child,
    width: 20,
    height: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
}
