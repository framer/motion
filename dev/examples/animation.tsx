import * as React from "react"
import { createAnimation, motion, useMotionValue, Frame } from "@framer"
import { Box } from "../styled"

const MotionBox = Frame()

export const App = () => {
    const x = useMotionValue(0)
    const animation = createAnimation(x, 400)
    return <MotionBox motionValues={{ x }} onClick={animation.start} />
}
