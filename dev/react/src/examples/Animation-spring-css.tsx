import { spring } from "framer-motion/dom"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}
export const App = () => {
    const [state, setState] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setState(true)
        }, 300)
    }, [state])

    return (
        <>
            <div
                style={{
                    ...style,
                    transform: state ? "translateX(200px)" : "none",
                    transition: "transform " + spring(0.2, 0),
                }}
            />
            <motion.div
                animate={{
                    transform: state ? "translateX(200px)" : "translateX(0)",
                }}
                transition={{ duration: 1, type: "spring" }}
                style={style}
            />
        </>
    )
}
