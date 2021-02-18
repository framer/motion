import * as React from "react"
import { useRef, useState } from "react"
import { motion } from "../../src"

const container = {
    width: "50%",
    height: 300,
    background: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}

const child = {
    width: 200,
    height: 200,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    const ref = useRef()
    const [count, setCount] = useState(0)
    return (
        <div ref={ref} style={container}>
            <motion.div
                drag
                //dragElastic
                dragConstraints={ref}
                onMeasureDragConstraints={(v) => console.log(v)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.1 }}
                style={child}
                onClick={() => setCount(count + 1)}
            />
        </div>
    )
}
