import { motion, useInstantLayoutTransition } from "framer-motion"
import { useState } from "react";

export const App = () => {
    const startTransition = useInstantLayoutTransition()
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [bgColor, setBgColor] = useState("#f00")
    const [state, setState] = useState(true)

    const handleClick = () => {
        startTransition(() => {
            setBgColor("#00f")
        })
        setState(!state)
    }
    return (
        <motion.div
            key={state ? "a" : "b"}
            id={state ? "a" : "b"}
            data-testid="box"
            layoutId="box"
            layout={type}
            style={{
                ...(state ? a : b),
                backgroundColor: bgColor,
                borderRadius: state ? 0 : 20,
            }}
            onClick={handleClick}
        />
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 0,
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
