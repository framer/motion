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
    const ref = useRef(null)
    const animation = useAnimation({})
    let rotation = 0
    const onTap = () => {
        rotation += 10
        animation.start({ rotate: rotation })
    }
    useTapGesture({ onTap }, ref)
    const onPan = () => {}
    usePanGesture({ onPan }, ref)
    return <motion.div animation={animation} pose={"default"} ref={ref} style={style} />
}
