import * as React from "react"
import { motion, MotionPlugins } from "../../src"

const styleA = {
    width: 100,
    height: 100,
    background: "blue",
}

const device = {
    width: 600,
    height: 800,
    background: "white",
    transform: "scale(0.5)",
}

const invert = (scale: number, point: number) => (point * 1) / scale
const invertScale = (scale: number) => point => {
    return { x: invert(scale, point.x), y: invert(scale, point.y) }
}

const Device = ({ children }) => (
    <MotionPlugins transformPagePoint={invertScale(0.5)}>
        <div style={device}>{children}</div>
    </MotionPlugins>
)

export const App = () => {
    return (
        <Device>
            <motion.div drag style={styleA} />
        </Device>
    )
}
