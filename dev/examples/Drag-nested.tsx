import * as React from "react"
import { motion } from "framer-motion"

const scroll = {
    width: 200,
    height: 600,
    background: "rgba(255,255,255,0.5)",
    borderRadius: 20,
    padding: 20,
}

const carousel = {
    width: 600,
    height: 200,
    background: "white",
    borderRadius: 10,
}

export const App = () => {
    return (
        <motion.div drag="y" style={scroll}>
            <motion.div drag="x" style={carousel} />
        </motion.div>
    )
}
