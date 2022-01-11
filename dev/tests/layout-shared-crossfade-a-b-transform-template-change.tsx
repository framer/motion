import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)
    const transformTemplate = state ? undefined : (_) => "translateY(-50%)"
    return (
        <motion.div
            data-key="wrapper"
            id="wrapper"
            layoutId="wrapper"
            style={{
                position: "relative",
                width: 400,
                height: 400,
                backgroundColor: "blue",
            }}
        >
            <AnimatePresence>
                <motion.div
                    id={state ? "a" : "b"}
                    data-testid="box"
                    layoutId="box"
                    layout={type}
                    style={{
                        ...(state ? a : b),
                        backgroundColor: state ? "#f00" : "#0f0",
                    }}
                    onClick={() => setState((_state) => !_state)}
                    transformTemplate={transformTemplate}
                />
            </AnimatePresence>
        </motion.div>
    )
}

const box = {
    display: "block",
    width: 200,
    height: 200,
    position: "absolute",
}

const a = {
    ...box,
    top: 100,
    left: 100,
}

const b = {
    ...box,
    inset: "50% auto auto 100px",
}
