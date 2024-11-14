import { motion, stagger, animate, animateMini } from "framer-motion"
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
            // setState(true)

            animateMini("div", { x: 100 }, { duration: 1, delay: stagger(0) })
        }, 300)
    }, [state])

    return (
        <motion.div
            // animate={{ x: state ? 0 : 100 }}
            transition={{ duration: 1 }}
            style={style}
        />
    )
}
