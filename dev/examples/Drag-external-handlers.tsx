import * as React from "react"
import { useRef } from "react"
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useTransform,
} from "@framer"

const container = {
    width: "50%",
    height: 300,
    background: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
}

const child: React.CSSProperties = {
    width: 200,
    height: 200,
    borderRadius: 20,
    pointerEvents: "none",
}

export const App = () => {
    const ref = useRef()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const style = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`
    const color = useTransform(
        x,
        [0, 100, 200, 300],
        ["red", "yellow", "green", "blue"]
    )
    return (
        <motion.div
            drag={"x"}
            style={container}
            _dragX={x}
            _dragY={y}
            ref={ref}
            dragConstraints={ref}
        >
            <motion.div
                style={{ transform: style, backgroundColor: color, ...child }}
            ></motion.div>
        </motion.div>
    )
}
