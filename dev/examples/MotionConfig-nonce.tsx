import * as React from "react"
import { motion, MotionConfig, AnimatePresence } from "framer-motion"

/**
 * An example of a nonce prop on MotionConfig
 */

const styleA = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: 20,
}

const styleB = {
    width: 100,
    height: 100,
    background: "blue",
    borderRadius: 20,
}

export const App = () => {
    const [toggle, setToggle] = React.useState(false)

    return (
        <MotionConfig nonce="abc123">
            <AnimatePresence mode="popLayout">
                {toggle ? (
                    <motion.div
                        key="a"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 1,
                        }}
                        style={styleA}
                    >
                        A
                    </motion.div>
                ) : (
                    <motion.div
                        key="b"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        transition={{
                            duration: 1,
                        }}
                        style={styleB}
                    >
                        B
                    </motion.div>
                )}
            </AnimatePresence>
            <button onClick={() => setToggle((prev) => !prev)}>Switch</button>
        </MotionConfig>
    )
}
