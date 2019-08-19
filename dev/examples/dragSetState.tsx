import * as React from "react"
import { motion } from "../../src"

const styleA = {
    width: 300,
    height: 300,
    background: "white",
    borderRadius: "10px",
}

console.clear()
export const App = () => {
    const [state, setState] = React.useState(0)

    const onDrag = () => {
        setState(state + 10)
    }

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: -500, right: 500 }}
            dragElastic
            dragMomentum
            dragTransition={{ bounceStiffness: 200, bounceDamping: 40 }}
            onDrag={onDrag}
            style={styleA}
        />
    )
}
