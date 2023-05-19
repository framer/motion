import { motion } from "framer-motion"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)

    return (
        <motion.div
            id="box"
            data-testid="box"
            layout={type}
            style={{ ...(state ? a : b) }}
            onClick={() => setState(!state)}
            transition={{ duration: 3 }}
        >
            <motion.div
                layout
                id="child"
                style={{ width: 100, height: 100, background: "blue" }}
                transition={{ duration: 3 }}
            />
        </motion.div>
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 0,
    background: "red",
}

const a = {
    ...box,
    width: 100,
    height: 100,
}

const b = {
    ...box,
    width: 400,
    height: 200,
    top: 100,
    left: 100,
}
