import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 200,
    height: 200,
    background: "white",
    opacity: 1,
}

const item = {
    width: 100,
    height: 100,
    background: "red",
}

const itemVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
}

const listVariants = {
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
        transition: {
            staggerChildren: 0.3,
            staggerDirection: -1,
        },
    },
}

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    setTimeout(() => {
        setVisible(!isVisible)
    }, 2000)

    return (
        <AnimatePresence initial={false} onRest={() => console.log("rest")}>
            {isVisible && (
                <motion.div
                    key="a"
                    initial={"closed"}
                    exit={"closed"}
                    animate="open"
                    variants={itemVariants}
                    transition={{ duration: 1 }}
                    style={style}
                >
                    <motion.ul variants={listVariants}>
                        <motion.li variants={itemVariants} style={item}>
                            Test
                        </motion.li>
                        <motion.li variants={itemVariants} style={item}>
                            Test
                        </motion.li>
                        <motion.li variants={itemVariants} style={item}>
                            Test
                        </motion.li>
                    </motion.ul>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
