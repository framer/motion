import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import { Box } from "../styled"
import { ComponentPoseNames } from "motion/types"

const MotionBox = motion(Box)({
    default: { scale: 1 },
    pressed: { scale: 1.2 },
})

type Poses = ComponentPoseNames<typeof MotionBox>

export const App = () => {
    const [pose, setPose] = useState<Poses>("default")

    return <MotionBox pose={pose} onMouseDown={() => setPose("pressed")} onMouseUp={() => setPose("default")} />
}
