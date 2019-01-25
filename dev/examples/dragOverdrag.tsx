import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "blue",
    borderRadius: "10px",
}

const containerStyle = {
    background: "#6dc1f9",
    width: 300,
    height: 300,
    padding: 20,
}

export const App = () => {
    return (
        <div>
            <motion.div
                dragEnabled={"x"}
                dragPropagation
                style={containerStyle}
            >
                <motion.div dragEnabled={"y"} style={styleA} />
            </motion.div>
        </div>
    )
}
