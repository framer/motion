import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
// Styles

const modalStyle = {
    background: "white",
    width: 320,
    height: "auto",
    padding: "20px 20px 0 20px",
}
const itemStyle = { width: "100%", marginBottom: 20, display: "flex" }
const contentStyle = { background: "#333", borderRadius: 5 }
const iconStyle = {
    ...contentStyle,
    flex: "0 0 100px",
    width: 100,
    height: 100,
    marginRight: 20,
}
const blurbStyle = { ...contentStyle, width: 200, height: 40, marginTop: 10 }
const smallBlurbStyle = { ...blurbStyle, width: 150, height: 20 }

// Animation variants
const itemVariants = {
    closed: { opacity: 0, x: -30 },
    open: {
        opacity: 1,
        x: 0,
        transition: { staggerChildren: 0.2, beforeChildren: true },
    },
}

const modalVariants = {
    closed: { opacity: 0, y: 100 },
    open: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
            delay: 1,
            duration: 0.3,
        },
    },
}

// Components
const Item = () => {
    return (
        <motion.div variants={itemVariants} style={itemStyle}>
            <div style={iconStyle} />
            <div>
                <motion.div variants={itemVariants} style={blurbStyle} />
                <motion.div variants={itemVariants} style={smallBlurbStyle} />
            </div>
        </motion.div>
    )
}

export const App = () => {
    return (
        <motion.div
            animate="open"
            initial="closed"
            variants={modalVariants}
            style={modalStyle}
        >
            <Item />
            <Item />
            <Item />
            <Item />
        </motion.div>
    )
}
