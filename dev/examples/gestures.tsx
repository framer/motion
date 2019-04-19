import * as React from "react"
import { useRef, useState } from "react"
import { motion, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const animation = useAnimation()
    let rotate = 0
    const onTap = () => {
        rotate += 10
        animation.start({ rotate })
    }
    return <motion.div animate={animation} onTap={onTap} style={style} />
}
