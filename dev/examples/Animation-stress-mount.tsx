import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of the tween transition type
 *
 * Base effect time at 6x CPU throttle with no pregenerated WAAPI animations - 130-160ms
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    "--number": 0,
}
const Box = () => {
    return (
        <motion.div
            animate={{
                backgroundColor: "var(--color)",
                rotate: 90,
                opacity: [0, 1],
                x: "50%",
                y: "50%",
                filter: [null, "blur(1px)"],
                "--number": 1,
            }}
            initial={{ x: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={style}
        />
    )
}

export const App = () => {
    return (
        <div
            style={{
                width: 1000,
                display: "flex",
                flexWrap: "wrap",
                "--color": "#f00",
            }}
        >
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
