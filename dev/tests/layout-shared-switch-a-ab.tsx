import { motion } from "framer-motion"
import * as React from "react"

const transition = {
    default: { duration: 0.2, ease: () => 0.1 },
    // opacity: { duration: 0.2, ease: () => 0.1 },
}

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(false)

    return (
        <>
            <motion.div
                id="a"
                layoutId="box"
                layout={type}
                style={a}
                onClick={() => setState(!state)}
                transition={transition}
            />
            {state && (
                <motion.div
                    id="b"
                    layoutId="box"
                    style={b}
                    transition={transition}
                    onClick={() => setState(!state)}
                />
            )}
        </>
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
    height: 200,
}

const b = {
    ...box,
    top: 100,
    left: 200,
    width: 300,
    height: 300,
}
