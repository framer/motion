import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of the tween transition type
 *
 * Effect time at 6x speed, ~120ms
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}
const Box = () => {
    return (
        <motion.div
            animate={{ backgroundColor: "#f00", rotate: 90, opacity: [0, 1] }}
            style={style}
        />
    )
}

export const App = () => {
    return (
        <div style={{ width: 1000, display: "flex", flexWrap: "wrap" }}>
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
            <Box />
        </div>
    )
}
