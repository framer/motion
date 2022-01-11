import { motion, LayoutGroup } from "framer-motion"
import * as React from "react"
import { useState } from "react"

const style = {
    width: 100,
    height: 100,
    background: "red",
    opacity: 1,
    borderRadius: 20,
    margin: 20,
}

const stackStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
}

const Item = () => {
    const [variant, setVariant] = useState("a")
    const isVisible = () => variant === "a"
    return (
        <LayoutGroup id="group-2">
            <motion.div style={{ display: "contents" }}>
                {isVisible() && (
                    <motion.div
                        id="a"
                        layoutId="a"
                        style={style}
                        onClick={() => setVariant(variant === "a" ? "b" : "a")}
                    />
                )}
            </motion.div>
        </LayoutGroup>
    )
}

export const App = () => {
    return (
        <LayoutGroup id="group-1">
            <motion.div style={{ display: "contents" }}>
                <motion.div style={stackStyle}>
                    <Item />
                </motion.div>
                <motion.div
                    layoutId="b"
                    style={{ ...style, backgroundColor: "blue" }}
                    id="b"
                    transition={{ duration: 0.2, ease: () => 0.5 }}
                />
            </motion.div>
        </LayoutGroup>
    )
}
