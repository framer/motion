import { motion, AnimateSharedLayout, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
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
            <motion.div layoutId="a" />
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
        <AnimateSharedLayout>
            <AnimatePresence initial={false} onRest={() => console.log("rest")}>
                {isVisible && <ExitComponent />}
            </AnimatePresence>
        </AnimateSharedLayout>
    )
}

// Move <AnimateSharedLayout> between Component and App to see that the child is removed
// whether or not AnimateSharedLayout rerenders

export const App = () => {
    return <Component />
}
