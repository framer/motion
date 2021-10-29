import { motion } from "@framer"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)

    return (
        <motion.div
            key={state ? "a" : "b"}
            id={state ? "a" : "b"}
            data-testid="box"
            layoutId="box"
            layout={type}
            style={{
                ...(state ? a : b),
                backgroundColor: state ? "#f00" : "#0f0",
                borderRadius: state ? 0 : 20,
            }}
            onClick={() => setState(!state)}
        />
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
