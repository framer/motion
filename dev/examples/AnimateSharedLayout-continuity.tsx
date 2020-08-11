import * as React from "react"
import { motion, AnimateSharedLayout, useCycle } from "@framer"

/**
 * An example of a component resuming animation and layout state using AnimateSharedLayout and layoutId
 */
function Component() {
    const [count, cycleCount] = useCycle(0, 1, 2, 3)

    return (
        <AnimateSharedLayout>
            <motion.div
                initial={false}
                style={{
                    position: "absolute",
                    ...styles[count],
                }}
                transition={{ duration: 3 }}
                animate={animate[count]}
                layoutId="box"
                id={`shape-${count}`}
                key={`shape-${count}`}
                onClick={() => cycleCount()}
            />
        </AnimateSharedLayout>
    )
}

export const App = () => {
    return <Component />
}

const animate = [
    {
        backgroundColor: "#fff",
        borderRadius: 10,
        opacity: 1,
    },
    {
        backgroundColor: "#fff",
        borderRadius: 100,
        opacity: 0.5,
    },
    {
        backgroundColor: "#fff",
        borderRadius: 0,
        opacity: 1,
    },
    {
        backgroundColor: "#fff",
        borderRadius: 50,
        opacity: 0.5,
    },
]

const styles = [
    {
        width: 100,
        height: 100,
        top: 100,
    },
    {
        width: 200,
        height: 200,
        left: 100,
    },
    {
        width: 100,
        height: 100,
        left: "calc(100vw - 100px)",
    },
    {
        width: 200,
        height: 200,
    },
]
