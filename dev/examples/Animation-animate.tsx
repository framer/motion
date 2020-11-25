import * as React from "react"
import { useEffect, useState } from "react"
import { motion, useMotionValue, animate } from "@framer"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const x = useMotionValue(0)
    const [target, setTarget] = useState(0)
    const transition = {
        type: "spring",
        duration: 0.4,
        dampingRatio: 0.4,
    }

    useEffect(() => {
        const controls = animate(x, target, {
            ...transition,
            onUpdate: (v) => console.log(v),
            onComplete: () => console.log("complete"),
        })

        return () => controls.stop()
    })

    return (
        <motion.div
            style={{ x, ...style }}
            onTap={() => setTarget(target + 100)}
        />
    )
}
