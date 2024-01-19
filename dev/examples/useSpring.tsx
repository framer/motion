import * as React from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

function DragExample() {
    const dragX = useMotionValue(0)
    const dragY = useMotionValue(0)
    const x = useSpring(dragX, { stiffness: 300, damping: 28 })
    const y = useSpring(dragY, { stiffness: 300, damping: 28 })
    return (
        <motion.div
            drag
            dragMomentum={false}
            _dragX={dragX}
            _dragY={dragY}
            style={{ width: 100, height: 100, background: "red", x, y }}
        />
    )
}

function AnimationExample() {
    const x = useMotionValue(0)
    const xSpring = useSpring(x)

    return (
        <div style={{ width: 100, height: 100, position: "relative" }}>
            <motion.div
                animate={{
                    x: [-200, 200],
                    transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                    },
                }}
                style={{ width: 100, height: 100, background: "lightblue", x }}
            />
            <motion.div
                style={{
                    width: 100,
                    height: 100,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    background: "lightblue",
                    opacity: 0.5,
                    x: xSpring,
                }}
            />
        </div>
    )
}

export function App() {
    return (
        <div style={{ display: "flex", gap: 100 }}>
            <DragExample />
            <AnimationExample />
        </div>
    )
}
