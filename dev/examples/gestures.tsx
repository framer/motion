import * as React from "react"
import { useRef, useState } from "react"
import { useTapGesture, motion } from "@framer"
import { useAnimation, usePanGesture } from "../../src"
import { notDeepEqual } from "assert"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const animation = useAnimation({})
    let rotate = 0
    const onTap = () => {
        rotate += 10
        animation.start({ rotate })
    }
    return <motion.div animation={animation} onTap={onTap} style={style} />
}
