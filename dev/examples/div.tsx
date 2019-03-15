import * as React from "react"
import { useState } from "react"
import { motion, useAnimation } from "../../src"

const stylea = {
    width: 50,
    height: 50,
    background: "blue",
    x: 100,
}

export const App = () => {
    const [isActive, setActive] = useState(false)
    const style = {
        width: 100,
        height: 100,
    }
    if (isActive) {
        style.background = "tomato"
    }
    return (
        <div>
            <motion.div style={style} />
            <div onClick={() => setActive(!isActive)} style={stylea} />
        </div>
    )
}
