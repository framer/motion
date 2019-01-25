import * as React from "react"
import { useState } from "react"
import { motion, useCycle } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    borderRadius: 5,
}

export const App = () => {
    const [animate, cycle] = useCycle([
        { x: 0, opacity: 1, borderRadius: 5, scale: 1, y: 0, rotate: 0 },
        { x: -100, rotate: 45 },
        { y: -100, scale: 2 },
        { x: 100, opacity: 1, borderRadius: 100 },
    ])
    console.log("attempting: ", animate)
    return <motion.div animate={animate} onTap={cycle} style={style} />
}
