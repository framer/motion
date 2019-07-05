import * as React from "react"
import { useState } from "react"
import { motion, useAnimation, useCycle } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
    boxShadow: "5px 5px 50px #000",
}

export const App = () => {
    const [elevation, cycle] = useCycle(
        { boxShadow: "5px 5px 50px #fff" },
        { boxShadow: "5px 5px 5px #000" }
    )

    return (
        <motion.div
            animate={elevation}
            transition={{ duration: 2 }}
            onTap={() => cycle()}
            style={style}
        />
    )
}
