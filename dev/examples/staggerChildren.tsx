import * as React from "react"
import { useState, useEffect } from "react"
import { motion, useAnimation, useCycle } from "@framer"

const sidebarStyle = {
    width: 100,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    background: "white",
    listStyle: "none",
    padding: 40,
    margin: 0,
}

const itemStyle = {
    width: 100,
    height: 100,
    background: "red",
    padding: 0,
    margin: 0,
}

export const App = () => {
    const [items, setItems] = React.useState([0, 1, 2, 3, 4, 5])
    const sidebarPoses = {
        open: {
            x: 0,
            transition: { when: "beforeChildren", staggerChildren: 0.05 },
        },
        closed: { x: -180 },
    }

    const itemPoses = {
        open: {
            scale: 1,
            opacity: 1,
            transition: {
                scale: {
                    type: "spring",
                    stiffness: 400,
                    velocity: 40,
                    damping: 20,
                },
            },
        },
        closed: { scale: 0.5, opacity: 0.1 },
    }

    return (
        <motion.ul
            variants={sidebarPoses}
            initial="closed"
            animate="open"
            style={sidebarStyle}
        >
            {items.map(i => (
                <motion.li key={i} variants={itemPoses} style={itemStyle} />
            ))}
        </motion.ul>
    )
}
