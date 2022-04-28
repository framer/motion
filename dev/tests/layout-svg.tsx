import { motion, useMotionValue } from "framer-motion"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)
    const backgroundColor = useMotionValue("red")

    return (
        <motion.div
            style={{ ...(state ? a : b), backgroundColor }}
            onClick={() => setState(!state)}
            transition={{ duration: 0.15, ease: () => 0.5 }}
        >
            <motion.svg
                id="box"
                data-testid="box"
                layout={type}
                viewBox="0 0 100 100"
                transition={{ duration: 0.15, ease: () => 0.5 }}
                style={{
                    flex: 1,
                }}
            />
        </motion.div>
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 0,
    background: "red",
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
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
