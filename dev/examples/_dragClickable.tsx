import * as React from "react"
import { motion } from "framer-motion"

const style = {
    display: "inline-block",
    padding: 20,
    background: "#eee",
}

export const App = () => {
    function onClick() {
        alert("click")
    }

    return (
        <motion.div drag style={style}>
            <p>Drag me</p>
            <button onClick={onClick}>Click me</button>
        </motion.div>
    )
}
