import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 100px;

    div {
        width: 100px;
        height: 100px;
        background-color: red;
    }
`

const Box = ({ id }: { id: number }) => {
    return (
        <motion.div
            id={`box-${id}`}
            className="box"
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0.5 }}
        />
    )
}

export const App = () => {
    const [range, setRange] = useState([0, 1, 2])

    return (
        <Container>
            <button id="remove" onClick={() => setRange(range.slice(0, -1))}>
                Remove
            </button>
            <AnimatePresence>
                {range.map((i) => (
                    <Box key={i} id={i} />
                ))}
            </AnimatePresence>
        </Container>
    )
}
