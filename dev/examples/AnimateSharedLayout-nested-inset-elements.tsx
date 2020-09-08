import * as React from "react"
import { motion, useCycle, AnimateSharedLayout, AnimatePresence } from "@framer"
import styled from "styled-components"

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <div
            onClick={() => toggleOn()}
            style={{
                position: "relative",
                margin: 20,
                width: 500,
                height: 500,
            }}
        >
            <AnimateSharedLayout type="crossfade" _supportRotate>
                <AnimatePresence>
                    <motion.div
                        key={isOn ? "a" : "b"}
                        layoutId="a"
                        style={{
                            ...container,
                            background: "white",
                            top: isOn ? undefined : 50,
                            left: isOn ? undefined : 50,
                            bottom: isOn ? 50 : undefined,
                            right: isOn ? 50 : undefined,
                            borderRadius: "50%",
                        }}
                        transition={{ duration: 2 }}
                    >
                        <motion.div
                            layoutId="b"
                            style={{
                                ...container,
                                background: isOn ? "#f00" : "#0f0",
                            }}
                            transition={{ duration: 2 }}
                        >
                            <motion.div
                                layoutId="c"
                                style={{
                                    ...container,
                                    background: isOn ? "#0f0" : "#f00",
                                }}
                                transition={{ duration: 2 }}
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </AnimateSharedLayout>
        </div>
    )
}

const container = {
    width: 150,
    height: 150,
    position: "absolute",
    inset: 0,
}
