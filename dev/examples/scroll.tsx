import * as React from "react"
import { motion } from "../../src"

const containerStyle = { width: 320, height: 500, overflow: "hidden" }
const contentStyle = {
    width: 320,
    height: 2000,
    background: "linear-gradient(#f00, #00f)",
}
const itemStyle = {
    width: 300,
    height: 44,
    background: "white",
    left: 10,
    position: "relative",
}

function list(size: number): number[] {
    const result = []
    for (let i = 0; i < size; i++) {
        result.push(i)
    }
    return result
}

export const App = () => {
    return (
        <div style={containerStyle}>
            <motion.div
                dragEnabled="lockDirection"
                dragConstraints={{ left: 0, right: 0, top: -1500, bottom: 0 }}
                style={contentStyle}
            >
                {list(20).map(v => (
                    <div
                        style={{
                            ...itemStyle,
                            top: 10 + 10 * v,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    )
}
