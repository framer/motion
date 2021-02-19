import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

/**
 * An example of AnimatePresence with exit defined as a variant through a tree.
 */

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
        opacity: 1,
        transition: { staggerChildren: 1, when: "beforeChildren" },
    },
    closed: {
        opacity: 0,
        transition: {
            when: "afterChildren",
            staggerChildren: 0.3,
            staggerDirection: -1,
        },
    },
}

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setVisible(!isVisible)
        }, 3000)
    })

    return (
        <AnimatePresence initial={false} onRest={() => console.log("rest")}>
            {isVisible && (
                <motion.ul
                    key="a"
                    initial={"closed"}
                    exit={"closed"}
                    animate="open"
                    variants={listVariants}
                    transition={{ duration: 1 }}
                    style={style}
                >
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
            )}
        </AnimatePresence>
    )
}
