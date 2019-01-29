import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: "10px",
}

import { useState } from "react"

export const App = () => {
    const variants = {
        default: { scaleX: 1, scaleY: 1 },
        squishX: { scaleX: 0.5, scaleY: 1.3 },
        squishY: { scaleX: 1.3, scaleY: 0.5 },
    }

    const [squish, setSquish] = useState("default")

    const onLock = axis => {
        if (axis === "x") {
            setSquish("squishY")
        } else {
            setSquish("squishX")
        }
    }

    return (
        <motion.div
            drag="lockDirection"
            onDirectionLock={onLock}
            onDragEnd={() => setSquish("default")}
            initial={{ scale: 1 }}
            tapActive={{ scale: 0.6 }}
            hoverActive={{ scale: 1.2 }}
            variants={variants}
            animate={squish}
            style={styleA}
        />
    )
}
