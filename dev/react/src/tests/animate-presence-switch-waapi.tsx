import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export const App = () => {
    const [state, setState] = useState(0)

    return (
        <>
            <button
                id="switch"
                onClick={() => {
                    state === 0 ? setState(1) : setState(0)
                }}
            >
                Switch
            </button>
            <AnimatePresence initial={false}>
                <motion.div
                    className="item"
                    key={state}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {state}
                </motion.div>
            </AnimatePresence>
        </>
    )
}
