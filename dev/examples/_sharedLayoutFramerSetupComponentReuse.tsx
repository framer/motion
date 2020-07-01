import * as React from "react"
import { useState } from "react"
import { motion, AnimateSharedLayout, AnimatePresence } from "@framer"
import styled from "styled-components"

/** This demo emulates the screen setup that Framer uses in Navigation component */

const Container = styled.div`
    width: 300px;
    height: 500px;
    overflow: hidden;
    background-color: #f3f3f3;
    border-radius: 20px;
    position: relative;
`

const screen = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
}

const card = {
    position: "absolute",
    top: 50,
    left: 50,
    width: 200,
    height: 200,
    background: "rgba(0,0,255,0.5)",
    borderRadius: 10,
}

function A({ layoutOrder }) {
    return (
        <motion.div style={screen}>
            <motion.div
                layoutId="card"
                layoutOrder={layoutOrder}
                style={{ ...card, top: 200, background: "green" }}
            ></motion.div>
        </motion.div>
    )
}

function B({ layoutOrder }) {
    return (
        <motion.div style={screen}>
            <motion.div
                layoutId="card"
                layoutOrder={layoutOrder}
                style={{ ...card, top: 200, background: "red" }}
            ></motion.div>
        </motion.div>
    )
}

function C({ layoutOrder }) {
    return (
        <motion.div style={screen}>
            <motion.div
                layoutId="card"
                layoutOrder={layoutOrder}
                style={{ ...card, background: "blue" }}
            ></motion.div>
        </motion.div>
    )
}

const stack = [A, B, C, A, B, C]

export const App = () => {
    const [page, setPage] = useState(0)

    const components = []

    for (let i = 0; i <= page; i++) {
        const Component = stack[i]
        const existingIndex = components.findIndex(
            entry => entry.Component === Component
        )

        if (existingIndex === -1) {
            components.push({
                Component: stack[i],
                key: i,
                layoutOrder: i,
            })
        } else {
            components[existingIndex] = {
                Component: stack[i],
                key: existingIndex,
                zIndex: 2,
                layoutOrder: i,
            }
        }
    }

    return (
        <Container onClick={() => setPage(page + 1)}>
            <AnimateSharedLayout
                type="crossfade"
                supportRotate
                transition={{ duration: 2 }}
            >
                <AnimatePresence>
                    {components.map(({ Component, ...props }) => (
                        <Component {...props} />
                    ))}
                </AnimatePresence>
            </AnimateSharedLayout>
        </Container>
    )
}
