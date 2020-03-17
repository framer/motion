import * as React from "react"
import { useState } from "react"
import { motion, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const controls = useAnimation()

    return (
        <motion.div
            animate={controls}
            initial={{ x: 10, background: "#fff" }}
        />
    )
}
