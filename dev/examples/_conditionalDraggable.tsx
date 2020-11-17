import * as React from "react"
import { motion, usePanGesture } from "../../src"
import { useState } from "react"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
}
const styleB = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const [drag, setDragEnabled] = useState(true)
    const onPress = () => setDragEnabled(!drag)
    return (
        <>
            <motion.div
                drag={drag}
                style={{ ...styleA, background: drag ? "green" : "yellow" }}
            />
            <motion.div onPress={onPress} style={styleB} />
        </>
    )
}
