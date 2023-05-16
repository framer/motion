import * as React from "react"
import { motion } from "framer-motion"

/**
 * An example of using whileHover to convert between different value types
 */

const style = {
    width: 100,
    height: 100,
    background: "white",
}

export const App = () => {
    const [translateX, setTranslateX] = React.useState("0%")

    React.useEffect(() => {
        setTimeout(() => setTranslateX("50%"), 1000)
    }, [])

    return (
        <motion.div
            onUpdate={console.log}
            animate={{ translateX }}
            style={{ ...style }}
        />
    )
}
