import { motion, useMotionValue, AnimateSharedLayout } from "@framer"
import * as React from "react"

export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)
    const backgroundColor = useMotionValue("#f00")

    return (
        <AnimateSharedLayout>
            <motion.div
                key={state ? "a" : "b"}
                id={state ? "a" : "b"}
                data-testid="box"
                layoutId="box"
                layout={type}
                style={{
                    ...(state ? a : b),
                    backgroundColor,
                    borderRadius: state ? 0 : 20,
                }}
                onClick={() => setState(!state)}
                transition={{ duration: 0.2, ease: () => 0.5 }}
                onLayoutAnimationComplete={() => backgroundColor.set("#00f")}
            />
        </AnimateSharedLayout>
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
