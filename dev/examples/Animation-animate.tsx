import * as React from "react"
import { useEffect, useState } from "react"
import { motion, motionValue, useMotionValue, animate } from "framer-motion"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [width] = useState(100)
    const [target, setTarget] = useState(0)
    const transition = {
        type: "spring" as const,
        duration: 0.4,
        dampingRatio: 0.4,
    }

    useEffect(() => {
        const controls = animate("div", { x: target }, transition)

        controls.then(() => console.log("complete"))

        return () => controls.stop()
    }, [target])

    return (
        <>
            <motion.div
                id="box"
                style={{
                    x: target,
                    ...style,
                    width: motionValue(width),
                    y: width / 10,
                }}
                onClick={() => {
                    setTarget(target + 100)
                    // setWidth(width + 100)
                }}
                initial={{ borderRadius: 10 }}
            />
            <div style={style} />
        </>
    )
}
