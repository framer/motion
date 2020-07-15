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

const child = {
    position: "absolute",
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    background: "rgba(0,255,0,1)",
    borderRadius: 20,
}

function A({ layoutOrder, zIndex, _shouldAnimate }) {
    return (
        <motion.div style={{ ...screen, zIndex }}>
            <motion.div
                key="card"
                layoutId="card"
                layoutOrder={layoutOrder}
                _shouldAnimate={false}
                style={{ ...card, background: "green" }}
            >
                <motion.div
                    key="child"
                    layoutId="child"
                    layoutOrder={layoutOrder}
                    _shouldAnimate={_shouldAnimate}
                    style={{ ...child }}
                ></motion.div>
            </motion.div>
        </motion.div>
    )
}

function B({ layoutOrder, zIndex, _shouldAnimate }) {
    return (
        <motion.div style={{ ...screen, zIndex }}>
            <motion.div
                layoutId="card"
                layoutOrder={layoutOrder}
                _shouldAnimate={false}
                style={{ ...card, background: "red" }}
            >
                <motion.div
                    layoutId="child"
                    layoutOrder={layoutOrder}
                    _shouldAnimate={_shouldAnimate}
                    style={{ ...child, top: 50 }}
                ></motion.div>
            </motion.div>
        </motion.div>
    )
}

const stack = [A, B, A, B, A, B]

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
                _shouldAnimate: i === 0 ? false : true,
            })
        } else {
            components[existingIndex] = {
                Component: stack[i],
                key: existingIndex,
                zIndex: i,
                layoutOrder: i,
                _shouldAnimate: true,
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
