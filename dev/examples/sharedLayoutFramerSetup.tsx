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

const Page = styled(motion.div)`
    background-color: ${({ color }) => color};
`

const screen = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
}

const screenA = { ...screen, background: "red" }

const screenB = { ...screen, background: "green" }

const screenC = { ...screen, background: "blue" }

const card = {
    position: "absolute",
    top: 50,
    left: 50,
    width: 200,
    height: 200,
    background: "pink",
}

const bigCard = {
    ...card,
    top: 200,
    left: 0,
    width: 300,
    height: 300,
    background: "pink",
}

function A() {
    return (
        <motion.div animate style={screenA}>
            <motion.div layoutId="cover" style={screen}>
                <motion.div layoutId="card" style={card}></motion.div>
            </motion.div>
        </motion.div>
    )
}

function B() {
    return (
        <motion.div layoutId="cover" style={screenB}>
            <motion.div layoutId="card" style={bigCard}></motion.div>
        </motion.div>
    )
}
function C() {
    return (
        <motion.div animate style={screenC}>
            <motion.div
                layoutId="card"
                style={{ ...bigCard, top: 0 }}
            ></motion.div>
        </motion.div>
    )
}

const Components = [A, B, C]

export const App = () => {
    const [page, setPage] = useState(1)

    const children = []

    for (let i = 0; i < page; i++) {
        const Component = Components[i]
        children.push(<Component key={i} />)
    }

    return (
        <Container
            onClick={() => setPage(page === 3 ? 2 : Math.min(3, page + 1))}
        >
            <AnimateSharedLayout crossfade transition={{ duration: 2 }}>
                <AnimatePresence>{children}</AnimatePresence>
            </AnimateSharedLayout>
        </Container>
    )
}
