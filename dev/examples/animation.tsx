import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

const style = {
    width: 100,
    height: 100,
    background: "red",
}

export const App = () => {
    return (
        <motion.div
            animate={{ background: "#000" }}
            initial={{ background: "#fff" }}
            transition={{ duration: 3 }}
            style={style}
        />
    )
}
