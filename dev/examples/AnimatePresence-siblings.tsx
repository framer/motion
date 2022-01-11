import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import * as React from "react"
import { useState } from "react"

/**
 * An example of an AnimatePresence child animating in and out with shared layout
 * ensuring that layout update is shared with the sibling `motion.div layout`
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
    opacity: 1,
    borderRadius: 20,
    margin: 20,
}

function ExitComponent({ id }) {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={style}
                id={id}
            />
        </>
    )
}

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    return (
        <LayoutGroup>
            <AnimatePresence
                initial={false}
                onExitComplete={() => console.log("rest a")}
            >
                {isVisible && <ExitComponent id="a" />}
            </AnimatePresence>
            <AnimatePresence
                initial={false}
                onExitComplete={() => console.log("rest b")}
            >
                {isVisible && <ExitComponent id="b" />}
            </AnimatePresence>
            <motion.div
                layout
                style={style}
                id="c"
                onClick={() => setVisible(!isVisible)}
            />
        </LayoutGroup>
    )
}
