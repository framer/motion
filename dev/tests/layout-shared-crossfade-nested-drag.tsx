import { motion, AnimatePresence, transform, useMotionValue } from "@framer"
import * as React from "react"

const transition = { duration: 2 }
export const App = () => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") || true
    const [state, setState] = React.useState(true)

    const x = useMotionValue(transform(50, [0, 100], [0, 100]))
    return (
        <AnimatePresence>
            <motion.div
                key={state ? "a" : "b"}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 500,
                    height: 400,
                }}
            >
                <motion.div
                    id={state ? "a" : "b"}
                    data-testid="box"
                    layoutId="box"
                    layout={type}
                    style={{
                        ...(state ? a : b),
                        backgroundColor: state ? "#f00" : "#0f0",
                        borderRadius: state ? 0 : 20,
                    }}
                    transition={transition}
                    onClick={() => setState(!state)}
                >
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: 100,
                            height: 100,
                        }}
                    >
                        <motion.div
                            id="child"
                            drag="x"
                            style={{
                                x,
                                y: 0,
                                width: 100,
                                height: 100,
                                backgroundColor: "blue",
                            }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
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
    width: 200,
    height: 200,
    top: 100,
    left: 200,
}

const b = {
    ...box,
    top: 300,
    left: 200,
    width: 300,
    height: 300,
}
