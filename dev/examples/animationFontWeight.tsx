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
    const variants = {
        normal: {
            scale: 1,
            // Enabling these crashes
            fontWeight: 100,
        },
        bold: {
            scale: 0.5,
            // Enabling these crashes
            fontWeight: 200,
        },
    }
    const [state, cycle] = useCycle(variants.normal, variants.bold)
    return (
        <motion.div
            onTap={() => cycle()}
            //variants={variants}
            animate={state}
            //style={{ fontWeight: "normal" }}
        >
            Hello
        </motion.div>
    )
}
