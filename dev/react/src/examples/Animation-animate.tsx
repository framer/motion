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
    return <motion.div animate={{ x: 100 }}>{/* <Child /> */}</motion.div>
}
