import { mix, motion, useAnimationFrame, useMotionValue } from "framer-motion"
import * as React from "react"

const transition = {
    default: { duration: 5 },
}

export const App = () => {
    const [state, setState] = React.useState(false)
    // Force animation frames to pull transform
    const opacity = useMotionValue(0)
    useAnimationFrame(() => opacity.set(mix(0.99, 1, Math.random())))

    return (
        <motion.div
            layout
            style={
                state
                    ? { width: 100, height: 200, background: "black" }
                    : { width: 200, height: 200, background: "black" }
            }
        >
            <motion.div
                id="a"
                layout="preserve-aspect"
                style={{
                    position: "absolute",
                    top: 100,
                    left: 100,
                    background: "red",
                    width: state ? 100 : 200,
                    height: 200,
                    opacity,
                }}
                onClick={() => setState(!state)}
                transition={transition}
            />
        </motion.div>
    )
}
