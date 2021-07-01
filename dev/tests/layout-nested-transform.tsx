import { motion, AnimateSharedLayout } from "@framer"
import * as React from "react"

export const App = () => {
    /**
     * TODO Needs batching
     */
    const [count, setCount] = React.useState(0)
    React.useEffect(() => setCount(1), [])
    return (
        <motion.div
            id="parent"
            layout
            style={{ ...b, x: 400 }}
            transition={{ duration: 0.15, ease: () => 0.5 }}
            _applyTransforms
        >
            <motion.div layout>
                <motion.div layout>
                    <motion.div layout>
                        <motion.div layout>
                            <Box />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

function Box() {
    const [count, setCount] = React.useState(0)

    return (
        <AnimateSharedLayout>
            <motion.div
                id="child"
                layout
                style={a}
                onClick={() => {
                    setCount(count + 1)
                }}
            />
        </AnimateSharedLayout>
    )
}

const box = {
    position: "absolute",
    background: "#dd1144",
    borderRadius: 10,
}

const a = {
    ...box,
    width: 100,
    height: 200,
    top: 50,
    left: 50,
    background: "#282828",
}

const b = {
    ...box,
    top: 20,
    left: 20,
    width: 300,
    height: 300,
    borderRadius: 20,
}
