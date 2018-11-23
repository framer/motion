import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import { Box } from "../styled"

const MotionBox = motion(Box)({
    default: { scale: 1 },
    pressed: { scale: 1.2 },
})

export const App = () => {
    const [pose, setPose] = useState("default")

    return <MotionBox pose={pose} onMouseDown={() => setPose("pressed")} onMouseUp={() => setPose("default")} />
}
