import { motion, AnimatePresence } from "@framer"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
}

export const App = () => {
    const [count, setCount] = useState(0)

    return (
        <>
            <AnimatePresence
                initial={false}
                onRest={() => console.log("rest")}
                single
            >
                <motion.div
                    key={items[count]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    style={{ ...style, background: items[count] }}
                />
                <motion.div
                    key={items[count + 1]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    style={{ ...style, background: items[count + 1] }}
                />
            </AnimatePresence>
            <button
                style={{ position: "absolute", top: 0, left: 50 }}
                onClick={() => setCount(count + 1)}
            >
                Right
            </button>
            <button
                style={{ position: "absolute", top: 0, left: 0 }}
                onClick={() => setCount(count - 1)}
            >
                Left
            </button>
        </>
    )
}

const items = ["red", "green", "blue", "yellow", "orange", "purple"]
