import { motion, AnimateSharedLayout, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

/**
 * An example of an AnimatePresence child animating in and out, and AnimateSharedLayout
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

function ExitComponent() {
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={style}
            />
        </>
    )
}

export const Component = () => {
    const [isVisible, setVisible] = useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setVisible(!isVisible)
        }, 1500)
    })

    return (
        <>
            <AnimatePresence initial={false} onRest={() => console.log("rest")}>
                {isVisible && <ExitComponent />}
            </AnimatePresence>
            <motion.div layout style={style} />
        </>
    )
}

export const App = () => {
    return (
        <AnimateSharedLayout>
            <Component />
        </AnimateSharedLayout>
    )
}
