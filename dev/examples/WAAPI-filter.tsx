import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    const [state, setState] = useState(false)

    return (
        <motion.div
            initial={{ filter: "hue-rotate(0deg)" }}
            animate={{ filter: "hue-rotate(180deg)" }}
            onClick={() => setState(!state)}
            transition={{ duration: 1 }}
            style={style}
        />
    )
}
