import * as React from "react"
import { useEffect, useRef } from "react"
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useTransform,
} from "@framer"

const parent = {
    background: "rgba(255,255,255,0.2)",
    width: "50%",
    height: 300,
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
}

const container = {
    width: 600,
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
}

export const App = () => {
    const ref = useRef()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`
    const color = useTransform(
        x,
        [0, 100, 200, 300],
        ["#f00", "#ff0", "#0f0", "#00f"]
    )

    useEffect(() => {
        return x.onChange(v => console.log(v))
    })

    return (
        <motion.div ref={ref} style={container}>
            <motion.div
                drag={"x"}
                _dragX={x}
                _dragY={y}
                dragConstraints={ref}
                onMeasureDragConstraints={constraints => constraints}
                style={{
                    backgroundColor: color,
                    ...child,
                    // x,
                    // y,
                }}
            />
            <motion.div
                style={{
                    transform,
                    backgroundColor: color,
                    ...child,
                }}
            />
        </motion.div>
    )
}
