import { motion, AnimatePresence, useCycle, useInvertedScale } from "@framer"
import * as React from "react"
import { useState } from "react"
import { UnstableSyncLayout } from "../../src/components/SyncLayout"

const modal = {
    borderRadius: 50,
    background: "white",
    padding: 50,
    overflow: "hidden",
}

const contentStyle = {
    padding: 20,
    overflow: "hidden",
}

const box = { width: 60, height: 60, background: "white", margin: 10 }

const transition = { duration: 3 }

const content = [
    ["red", 300, 300],
    ["green", 700, 600],
    ["blue", 200, 300],
    ["purple", 700, 100],
    ["green", 400, 300],
]

const Content = ({ page }) => {
    const [background, height, width] = content[page]
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                ...contentStyle,
                background,
                width,
                height,
                ...useInvertedScale(),
            }}
        >
            <div style={box} />
            <div style={box} />
            <div style={box} />
        </motion.div>
    )
}

export const App = () => {
    const [page, cycle] = useCycle(0, 1, 2, 3, 4)

    return (
        <div>
            <UnstableSyncLayout>
                <motion.div
                    style={modal}
                    layoutTransition
                    onClick={() => cycle()}
                >
                    <AnimatePresence exitBeforeEnter>
                        <Content key={page} page={page} />
                    </AnimatePresence>
                </motion.div>
            </UnstableSyncLayout>
        </div>
    )
}
