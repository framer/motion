import * as React from "react"
import { motion, usePose } from "@framer"
import { Box } from "../styled"

const MotionBox = motion(Box)({
    b: { width: "auto", x: "50%" },
    c: { width: "calc(50vw)", x: 0 },
    a: { width: 100, x: 100 },
})

export const App = () => {
    const [pose, setPose] = usePose("b", ["b", "a", "c"])

    return (
        <div style={{ flex: "0 0 100%" }}>
            <MotionBox pose={pose} onClick={() => setPose.cycle()} />
        </div>
    )
}
