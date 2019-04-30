import * as React from "react"
import { useState } from "react"
import { motion, useAnimation, useCycle } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [elevation, cycle] = useCycle(
        { boxShadow: "5px 5px 50px #000" },
        { boxShadow: "5px 5px 5px #fff" }
    )

    return (
        <motion.div style={style} animate={elevation} onTap={() => cycle()} />
    )
}
