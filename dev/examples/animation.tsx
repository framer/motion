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
    const animation = useAnimation({
        visible: { opacity: 1 },
        right: { x: 100 },
    })

    const seq = async () => {
        animation.start("visible")
        animation.start("right")
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
            onMouseEnter={() => console.log("test")}
        />
    )
}
