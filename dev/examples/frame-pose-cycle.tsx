import * as React from "react"
import { Frame, usePose } from "@framer"

const MovingFrame = Frame({
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
})
export function App() {
    const [pose, setPose] = usePose<typeof MovingFrame>("visible", ["visible", "hidden"])
    return <MovingFrame pose={pose} onClick={() => setPose.cycle()} />
}
