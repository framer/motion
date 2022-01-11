import { motion } from "framer-motion"
import * as React from "react"

export const App = () => {
    const [state, setState] = React.useState(true)

    React.useEffect(() => {
        setState(!state)
    }, [])

    return (
        <motion.div
            id="parent"
            drag
            dragElastic={0}
            dragMomentum={false}
            layout
            style={{
                width: 200,
                height: 200,
                background: "red",
            }}
        >
            <motion.div
                id="child"
                layout
                style={{ width: 100, height: 100, background: "blue" }}
            />
        </motion.div>
    )
}
