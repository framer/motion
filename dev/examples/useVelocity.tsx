import * as React from "react"
import {
    motion,
    useMotionValue,
    useVelocity,
    useMotionValueEvent,
    frameData,
} from "framer-motion"

export const App = () => {
    const x = useMotionValue(0)
    const xVelocity = useVelocity(x)
    const xAcceleration = useVelocity(xVelocity)

    useMotionValueEvent(x, "change", (v: number) =>
        console.log("x", Math.round(v), "at", Math.round(frameData.timestamp))
    )

    useMotionValueEvent(xVelocity, "change", (v: number) =>
        console.log(
            "x velocity",
            Math.round(v),
            "at",
            Math.round(frameData.timestamp)
        )
    )

    useMotionValueEvent(xAcceleration, "change", (v: number) =>
        console.log(
            "x acceleration",
            Math.round(v),
            "at",
            Math.round(frameData.timestamp)
        )
    )

    return (
        <motion.div
            animate={{ x: 100 }}
            transition={{ duration: 1, ease: "linear" }}
            style={{ x, width: 100, height: 100, background: "red" }}
        />
    )
}
