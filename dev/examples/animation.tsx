import * as React from "react"
import { createAnimation } from "@framer"
import { Box } from "../styled"

const MotionBox = motion(Box)()

export const App = () => {
    const x = useMotionValue(0)
    const animation = createAnimation(x, 400)

    return <MotionBox motionValues={{ x }} onClick={animation.start} />
}
