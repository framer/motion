import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"

const style = {
    width: 100,
    height: 100,
    background: "white",
    borderRadius: 20,
}

export const App = () => {
    const [state, setState] = useState(false)

    return (
        <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 720 }}
            whileHover={{ scale: 2 }}
            onClick={() => setState(!state)}
            transition={{ default: { duration: 10 }, scale: { duration: 0.5 } }}
            style={style}
        />
    )
}
