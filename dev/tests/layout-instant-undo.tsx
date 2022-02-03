import { motion } from "framer-motion"
import * as React from "react"
import { useLayoutEffect } from "react"

export const App = () => {
    const [state, setState] = React.useState(true)

    useLayoutEffect(() => {
        if (state === false) setState(true)
    }, [state])

    return (
        <motion.div
            id="box"
            data-testid="box"
            layout
            style={state ? a : b}
            onClick={() => setState(!state)}
            transition={{ duration: 10 }} //, ease: (p) => (p === 1 ? p : 0) }}
        />
    )
}

const box = {
    position: "absolute",
    top: 0,
    left: 200,
    width: 100,
    height: 100,
    background: "red",
}

const a = box

const b = {
    ...box,
    left: 500,
}
