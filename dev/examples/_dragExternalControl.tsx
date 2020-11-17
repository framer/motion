import * as React from "react"
import { useState } from "react"
import { motion, useMotionValue } from "../../src"

const style = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}

export const App = () => {
    const [dragOriginEvent, setDragOriginEvent] = useState<Event | null>(null)

    return (
        <motion.div
            dragOriginEvent={dragOriginEvent}
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
        >
            <motion.div
                style={style}
                onPressStart={(e) => setDragOriginEvent(e)}
                onPressCancel={() => setDragOriginEvent(null)}
                onPress={() => setDragOriginEvent(null)}
            />
            <motion.div
                style={style}
                onPressStart={(e) => setDragOriginEvent(e)}
                onPressCancel={() => setDragOriginEvent(null)}
                onPress={() => setDragOriginEvent(null)}
            />
        </motion.div>
    )
}
