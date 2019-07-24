import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, useMotionValue, useTransform, useAnimation } from "@framer"

// https://github.com/framer/motion/issues/216
const animation = {
    strokeDasharray: ["1px, 200px", "100px, 200px", "100px, 200px"],
    strokeDashoffset: [0, -15, -125],
    transition: { duration: 1.4, ease: "linear" },
    cx: 100,
    cy: 100,
}

export const App = () => {
    const controls = useAnimation()

    const handleAnimationComplete = useCallback(
        () => {
            controls.start(animation)
        },
        [controls]
    )

    useEffect(
        () => {
            controls.start(animation)
        },
        [controls]
    )

    return (
        <motion.svg
            viewBox="22 22 44 44"
            width="44"
            height="44"
            animate={{ rotate: 90 }}
        >
            <motion.circle
                animate={controls}
                onAnimationComplete={handleAnimationComplete}
                r="20.2"
                fill="none"
                stroke="white"
                strokeWidth="3.6"
            />
        </motion.svg>
    )
}
