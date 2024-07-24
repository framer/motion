import { motion, useMotionValue } from "framer-motion"
import { useState } from "react";

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = useState(true)
    const backgroundColor = useMotionValue("red")

    return (
        <motion.div
            id="box"
            data-testid="box"
            layout={type}
            layoutDependency={0}
            style={{ ...(state ? a : b), backgroundColor }}
            onClick={() => setState(!state)}
            transition={{ duration: 0.15, ease: () => 0.5 }}
            onLayoutAnimationComplete={() => backgroundColor.set("blue")}
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
