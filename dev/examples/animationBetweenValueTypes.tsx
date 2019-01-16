import * as React from "react"
import { useEffect, useState } from "react"
import { motion, useAnimation } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const animation = useAnimation()

    const animate = async () => {
        // Start with normal number, which is default value type (in this case px)
        await animation.start({ x: 100 })

        // Then animate to a different value type like calc
        animation.start({ x: "-100%" })
    }

    useEffect(() => {
        animate()
    }, [])

    return <motion.div animate={animation} style={style} />
}
