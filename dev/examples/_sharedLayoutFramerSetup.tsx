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
}

function A({ debugId }) {
    return <motion.div debugId={debugId} style={screen}></motion.div>
}

function B({ debugId }) {
    return (
        <motion.div style={screen}>
            <motion.div
                layoutId="card"
                debugId={debugId}
                style={{ ...card, top: 200, background: "red" }}
            ></motion.div>
        </motion.div>
    )
}

function C({ debugId }) {
    return (
        <motion.div debugId={debugId} style={screen}>
            <motion.div
                layoutId="card"
                debugId={debugId}
                style={{ ...card, background: "blue" }}
            ></motion.div>
        </motion.div>
    )
}

export const App = () => {
    const [page, setPage] = useState(0)
    const [count, setCount] = useState(0)
    console.log(count)
    return (
        <Container
            onClick={() => {
                setPage(page === 0 ? 1 : 0)
                setCount(count + 1)
            }}
        >
            <AnimateSharedLayout
                type="crossfade"
                supportRotate
                transition={{ duration: 2 }}
            >
                <AnimatePresence>
                    <A key="a" debugId="a" />
                    {count >= 1 && count <= 3 && (
                        <B key={`b-1`} debugId={`b-${count}`} />
                    )}
                    {count === 2 && <C key={`b-2`} debugId={`b-${count}`} />}
                </AnimatePresence>
            </AnimateSharedLayout>
        </Container>
    )
}
