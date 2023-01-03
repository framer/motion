import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [opacity, setOpacity] = useState(1)

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity }}
            onClick={() => setOpacity(opacity === 1 ? 0 : 1)}
            transition={{ duration: 0.5 }}
            style={style}
        />
    )
}
