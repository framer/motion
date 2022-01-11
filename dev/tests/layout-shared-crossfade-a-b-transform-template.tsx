import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)

    return (
        <motion.div
            style={{
                position: "relative",
                width: 500,
                height: 500,
                backgroundColor: "blue",
            }}
        >
            <AnimatePresence>
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
                    transition={{ duration: 0.2, ease: () => 0.5 }}
                    onClick={() => setState(!state)}
                    transformTemplate={(_, generated) =>
                        `translate(-50%, -50%) ${generated}`
                    }
                />
            </AnimatePresence>
        </motion.div>
    )
}

const box = {
    position: "absolute",
    top: "50%",
    left: "50%",
    background: "red",
}

const a = {
    ...box,
    width: 100,
    height: 200,
}

const b = {
    ...box,
    top: "50%",
    left: "50%",
    width: 300,
    height: 300,
}
