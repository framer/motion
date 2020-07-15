import * as React from "react"
import { useRef } from "react"
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
    return (
        <div ref={ref} style={container}>
            <motion.div
                drag
                //dragElastic
                dragConstraints={ref}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.1 }}
                style={child}
            />
        </div>
    )
}
