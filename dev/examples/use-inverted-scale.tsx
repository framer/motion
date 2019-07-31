import * as React from "react"
import { motion, useInvertedScale } from "@framer"

const container = {
    width: 500,
    height: 250,
    padding: 20,
    background: "white",
    overflow: "hidden",
}

const content = {
    width: "100%",
    height: "100%",
    background: "blue",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}

const box = {
    width: 50,
    height: 50,
    margin: 20,
    flex: "0 0 50px",
    background: "red",
}

const Content = () => {
    const inverted = useInvertedScale()

    return (
        <motion.div style={{ ...inverted, ...content }}>
            <div style={box} />
            <div style={box} />
            <div style={box} />
        </motion.div>
    )
}

export const App = () => {
    return (
        <motion.div
            initial={{ scaleX: 0, scaleY: 0 }}
            animate={{ scaleX: 2, scaleY: 2 }}
            transition={{ duration: 5, yoyo: Infinity }}
            style={container}
        >
            <Content />
        </motion.div>
    )
}
