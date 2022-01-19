import * as React from "react"
import { motion, useCycle } from "framer-motion"
import styled from "styled-components"

/**
 * This is an example used to stress-test the updateDelta algorithm
 */
const transition = { duration: 3, ease: "circIn" }

const maxChildren = 4
const maxDepth = 2
function layoutChildren(currentDepth: number) {
    const children = []

    for (let i = 0; i < maxChildren; i++) {
        children.push(
            <motion.div layout key={i}>
                {currentDepth < maxDepth && layoutChildren(currentDepth + 1)}
            </motion.div>
        )
    }

    return children
}

export const App = () => {
    const [isOpen, toggleIsOpen] = useCycle(true, false)

    return (
        <Container layout data-isOpen={isOpen} onClick={toggleIsOpen}>
            {layoutChildren(0)}
        </Container>
    )
}

const Container = styled(motion.div)`
    width: 500px;
    height: 500px;
    background: white;
    display: flex;
    align-items: stretch;
    justify-content: stretch;

    div {
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        background-color: red;
        width: 25%;
        height: 25%;

        div {
            background-color: blue;

            div {
                background-color: green;
            }
        }
    }

    &[data-isOpen="true"] {
        align-items: flex-end;
        div {
            align-items: flex-end;
        }
    }
`
