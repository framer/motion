import { useState } from "react"
import { MotionConfig, motion } from "framer-motion"

/**
 * An example of the tween transition type
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [state, setState] = useState(true)

    return (
        <MotionConfig transition={{ duration: 1 }}>
            <motion.div
                initial={{ display: "block" }}
                animate={{
                    display: state ? "block" : "none",
                    visibility: state ? "visible" : "hidden",
                    opacity: state ? 1 : 0.2,
                }}
                onUpdate={console.log}
                style={style}
            />
            <button onClick={() => setState(!state)}>Toggle</button>
        </MotionConfig>
    )
}
