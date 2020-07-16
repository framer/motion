import * as React from "react"
import { motion, useMotionValue, useTransform } from "@framer"
import styled from "styled-components"

/**
 * This is an example of hooking up MotionValues to the component's projected layout
 * via the layoutX and layoutY props.
 */

export const Example = () => {
    const x = useMotionValue(0)
    const xInput = [-100, 0, 100]
    const background = useTransform(x, xInput, [
        "linear-gradient(180deg, #ff008c 0%, rgb(211, 9, 225) 100%)",
        "linear-gradient(180deg, #7700ff 0%, rgb(68, 0, 255) 100%)",
        "linear-gradient(180deg, rgb(230, 255, 0) 0%, rgb(3, 209, 0) 100%)",
    ])
    const color = useTransform(x, xInput, [
        "rgb(211, 9, 225)",
        "rgb(68, 0, 255)",
        "rgb(3, 209, 0)",
    ])
    const tickPath = useTransform(x, [10, 100], [0, 1])
    const crossPathA = useTransform(x, [-10, -55], [0, 1])
    const crossPathB = useTransform(x, [-50, -100], [0, 1])

    return (
        <motion.div className="example-container" style={{ background }}>
            <motion.div
                className="box"
                layoutX={x}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
            >
                <svg className="progress-icon" viewBox="0 0 50 50">
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={color}
                        d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                        style={{ translateX: 5, translateY: 5 }}
                    />
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={color}
                        d="M14,26 L 22,33 L 35,16"
                        strokeDasharray="0 1"
                        style={{ pathLength: tickPath }}
                    />
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={color}
                        d="M17,17 L33,33"
                        strokeDasharray="0 1"
                        style={{ pathLength: crossPathA }}
                    />
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={color}
                        d="M33,17 L17,33"
                        strokeDasharray="0 1"
                        style={{ pathLength: crossPathB }}
                    />
                </svg>
            </motion.div>
        </motion.div>
    )
}

export const App = () => {
    return (
        <Container>
            <Example />
        </Container>
    )
}

const Container = styled.div`
    .example-container {
        width: 100vw;
        height: 100vh;
    }

    .box {
        background: white;
        border-radius: 30px;
        width: 150px;
        height: 150px;
        position: absolute;
        top: calc(50% - 150px / 2);
        left: calc(50% - 150px / 2);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .progress-icon {
        width: 80%;
        height: 80%;
    }

    .refresh {
        padding: 10px;
        position: absolute;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 10px;
        width: 20px;
        height: 20px;
        top: 10px;
        right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
`
