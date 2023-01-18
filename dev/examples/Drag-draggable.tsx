import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

const styleA = {
    width: 200,
    height: 200,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    const ref = useRef(null)
    const [isTap, setTap] = useState(false)
    const [isDrag, setDrag] = useState(false)
    const [isHover, setHover] = useState(false)
    const [dragCount, setDragCount] = useState(0)

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: 100, top: 0, bottom: 100 }}
            ref={ref}
            dragElastic={0}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => {
                console.log("hover start")
                setHover(true)
            }}
            onHoverEnd={() => {
                console.log("hover end")
                setHover(false)
            }}
            style={styleA}
        />
    )
}
