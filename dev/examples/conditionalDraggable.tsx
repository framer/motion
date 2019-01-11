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
    const [dragEnabled, setDragEnabled] = useState(true)
    const onTap = () => setDragEnabled(!dragEnabled)
    const ref: React.RefObject<Element> | undefined = undefined
    const test = usePanGesture({}, undefined)
    return (
        <>
            <motion.div dragEnabled={dragEnabled} style={{ ...styleA, background: dragEnabled ? "green" : "yellow" }}>
                {/* <motion.div dragEnabled style={styleB} dragPropagation={true} />

            <motion.div dragEnabled={"x"} style={styleB} /> */}
            </motion.div>

            <motion.div onTap={onTap} dragLocksDirection style={styleB} />
        </>
    )
}
