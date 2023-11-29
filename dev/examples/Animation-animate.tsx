import * as React from "react"
import { useEffect, useState } from "react"
import { motion, motionValue, useAnimate } from "framer-motion"
import { frame } from "framer-motion"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

const Child = ({ setState }: any) => {
    const [width] = useState(100)
    const [target, setTarget] = useState(0)
    const transition = {
        duration: 10,
    }

    const [scope, animate] = useAnimate()

    useEffect(() => {
        const controls = animate([
            [
                "div",
                { x: 500, opacity: 0 },
                { type: "spring", duration: 1, bounce: 0 },
            ],
        ])

        controls.then(() => {
            controls.play()
        })

        return () => controls.stop()
    }, [target])

    return (
        <div ref={scope}>
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
            {/* <div style={style} onClick={() => setState(false)} /> */}
        </div>
    )
    return
}

export const App = () => {
    const [state, setState] = useState(true)
    let isAnimating = false
    frame.postRender(() => {
        frame.postRender(() => console.log(isAnimating))
    })
    return (
        <motion.div
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                opacity: { duration: 2, type: "tween" },
                // x: { type: "spring", velocity: 1000 },
            }}
            onAnimationStart={() => {
                isAnimating = true
            }}
            onAnimationComplete={() => {
                isAnimating = false
            }}
        />
    )
    return state && <Child setState={setState} />
}
