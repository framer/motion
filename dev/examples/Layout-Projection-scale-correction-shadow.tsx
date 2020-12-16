import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

/**
 * This demonstrates the scale correction of box shadow
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <motion.div
            layout
            initial={{ borderRadius: 20, boxShadow: "10px 10px 20px #000" }}
            transition={{
                boxShadow: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                },
                default: { duration: 2 },
            }}
            style={!isOn ? big : small}
            onClick={() => setIsOn(!isOn)}
        />
    )
}

const big = {
    width: 400,
    height: 400,
    backgroundColor: "white",
}

const small = {
    width: 200,
    height: 200,
    backgroundColor: "white",
    boxShadow: "10px 15px 5px red",
}
