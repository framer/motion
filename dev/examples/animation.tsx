import * as React from "react"
import { useState } from "react"
import { motion, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const animation = useAnimation()

    const seq = async () => {
        await animation.start({ opacity: 1 })
        animation.start({ x: 100, transition: { duration: 0.4 } })
    }

    React.useEffect(() => {
        seq()
    }, [])

    return (
        <motion.div
            animate={animation}
            initial={{ opacity: 0 }}
            transition={{ duration: 5 }}
            style={style}
        />
    )
}
