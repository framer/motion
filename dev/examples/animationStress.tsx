import * as React from "react"
import { useState } from "react"
import { motion, useCycle, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [animate, cycle] = useCycle([
        { background: "#f00" },
        { background: "#0f0" },
    ])

    setTimeout(cycle, 100)
    return <motion.div animate={animate} style={style} />
}
