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

    const seq = async () => {
        await animation.start({ opacity: 0 })
    }

    React.useEffect(() => {
        seq()
    }, [])

    return (
        <motion.div
            animate={animation}
            transition={{ duration: 5 }}
            style={style}
        />
    )
}
