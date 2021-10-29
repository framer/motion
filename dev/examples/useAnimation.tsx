import * as React from "react"
import { motion, useAnimation, useMotionValue } from "@framer"

/**
 * An example of firing an animation onMount using the useAnimation hook
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    opacity: 1,
    borderRadius: 20,
}

export const App = () => {
    const controls = useAnimation()
    const variants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    }
    const x = useMotionValue(0)
    React.useEffect(() => {
        controls.start("visible")

        setTimeout(() => x.set(100), 2000)
    })

    return (
        <motion.div animate={controls} initial="hidden">
            <motion.div variants={variants} drag style={{ ...style, x }} />
        </motion.div>
    )
}
