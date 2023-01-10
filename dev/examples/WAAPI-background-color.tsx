import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [state, setState] = useState(false)

    return (
        <motion.div
            initial={{ backgroundColor: "blue" }}
            animate={{ backgroundColor: state ? "blue" : "red" }}
            onClick={() => setState(!state)}
            transition={{ duration: 2 }}
            style={style}
        />
    )
}
