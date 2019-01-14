import * as React from "react"
import { Frame, usePose } from "@framer"
import { useInterval } from "../inc/use-interval"

const MovingFrame = Frame({
    left: {
        x: 100,
    },
})
export function App() {
    const [pose, setPose] = usePose<typeof MovingFrame>("default")
    useInterval(() => {
        setPose("left")
    }, 1000)
    return <MovingFrame pose={pose} />
}
