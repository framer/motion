import * as React from "react"
import { motion, usePose, createAnimation as animate, useMotionValue } from "@framer"
import { Box } from "../styled"

const MotionBox = motion(Box)()

export const App = () => {
    const x = useMotionValue(0)

    const animation = () => animate(x, 400)

    return <MotionBox motionValues={{ x }} onClick={animation} />
}
