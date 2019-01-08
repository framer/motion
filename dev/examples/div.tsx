import * as React from "react"
import { useState } from "react"
import { motion, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}
const stylea = {
    width: 50,
    height: 50,
    background: "blue",
    x: 100,
}

export const App = () => {
    const animation = {
        default: { x: 0 },
        active: () => [{ x: 200 }, { beforeChildren: true }],
    }

    const childPoses = {
        default: { opacity: 0.2 },
        active: { opacity: 1 },
    }

    const [isActive, setActive] = useState(true)

    return (
        <motion.div
            animation={animation}
            pose={isActive ? "active" : "default"}
            onClick={() => setActive(!isActive)}
            style={style}
        >
            <motion.div animation={childPoses} inherit style={stylea} />
        </motion.div>
    )
}
