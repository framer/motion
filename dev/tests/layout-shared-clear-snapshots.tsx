import { motion, useCycle } from "@framer"
import * as React from "react"

export const App = () => {
    const [state, cycle] = useCycle(0, 1, 2)

    return (
        <>
            <button id="next" onClick={() => cycle()}>
                Next
            </button>
            {state !== 1 ? (
                <motion.div
                    id="box"
                    layout
                    layoutId="box"
                    style={{ ...(state === 0 ? a : b) }}
                    transition={{
                        duration: 0.15,
                        // ease: state === 2 ? () => 0.5 : undefined,
                    }}
                />
            ) : null}
        </>
    )
}

const box = {
    position: "absolute",
    top: 100,
    left: 0,
    width: 100,
    height: 100,
    background: "red",
}

const a = {
    ...box,
}

const b = {
    ...box,
    left: 200,
}
