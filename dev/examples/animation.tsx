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
    const animation = useAnimation()
    const variants = {
        visible: { opacity: 1 },
        right: { x: 100 },
    }

    animation.start("visible")

    return (
        <motion.div
            animate={animation}
            initial={{ rotate: 0, opacity: 0 }}
            variants={variants}
            transition={{ duration: 5 }}
            style={style}
            onMouseEnter={() => console.log("test")}
        />
    )
}
