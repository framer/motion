import * as React from "react"
import { useState } from "react"
import { motion, SharedMagicMotion } from "@framer"

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            magic
            transition={{ duration: 2 }}
            style={!isOn ? big : small}
            onClick={() => setIsOn(!isOn)}
        />
    )
}

const big = {
    width: 400,
    height: 400,
    borderRadius: 20,
    backgroundColor: "white",
}

const small = {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: "white",
    boxShadow: "10px 15px 5px red",
}
