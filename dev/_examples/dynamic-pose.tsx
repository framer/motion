import * as React from "react"
import { motion, usePose } from "@framer"
import { Box } from "../styled"
import { useInterval } from "../inc/use-interval"

const MotionBox = motion(Box)({
    ping: {
        x: 100,
        y: "0vh",
        transition: { duration: 100 },
    },
    pong: ({ targetValue }) => {
        return { x: targetValue, y: "0vh" }
    },
})

export const App = () => {
    const [pose, setPose] = usePose<typeof MotionBox>("ping")

    useInterval(() => {
        setPose(pose.get() === "ping" ? "pong" : "ping")
    }, 1000)

    return <MotionBox pose={pose} targetValue={-100} />
}
