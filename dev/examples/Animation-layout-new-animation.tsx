import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"

export function App() {
    // updates the state for the sake of updating it,
    // this will cause the animation to stutter from v2.5.0
    const [, setSomething] = React.useState(Math.random())
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSomething(Math.random())
        }, 250)
        return () => {
            clearInterval(interval)
        }
    }, [])

    // sets the size once a second to keep the animation going
    const [size, setSize] = React.useState(false)
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSize(!size)
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [size])

    return (
        <motion.div
            layout
            style={{
                display: "block",
                position: "relative",
                width: `${size ? 25 : 250}px`,
                height: `${size ? 25 : 250}px`,
                background: "#FFF",
            }}
            transition={{ duration: 1 }}
        />
    )
}
