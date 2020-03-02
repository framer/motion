import { usePresence, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

const Component = () => {
    const [isPresent, safeToRemove] = usePresence()

    React.useEffect(() => {
        !isPresent && setTimeout(safeToRemove, 1000)
    }, [isPresent])

    return <div style={{ ...style, background: isPresent ? "green" : "red" }} />
}

export const App = () => {
    const [isVisible, setVisible] = useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setVisible(!isVisible)
        }, 2000)
    })

    return (
        <AnimatePresence initial={false} onRest={() => console.log("rest")}>
            {isVisible && <Component />}
        </AnimatePresence>
    )
}
