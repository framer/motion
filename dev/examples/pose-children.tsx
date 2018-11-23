import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import { Box } from "../styled"
import useInterval from "../inc/use-interval"

const Parent = motion.div({
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 50,
        },
    },
    hidden: { opacity: 0, y: 100 },
})

const Child = motion.div({
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -100 },
})

const parentStyles = {
    width: 400,
    height: 500,
    background: "red",
    padding: 10,
}

const childStyles = {
    width: "100%",
    height: 50,
    background: "black",
    marginBottom: 30,
}

export const App = () => {
    const [pose, setPose] = useState("hidden")

    useInterval(() => setPose(pose === "hidden" ? "visible" : "hidden"), 2000, [pose])

    return (
        <Parent style={parentStyles} pose={pose}>
            <div>
                <Child style={childStyles} />
                <Child style={childStyles} />
                <Child style={childStyles} />
            </div>
        </Parent>
    )
}
