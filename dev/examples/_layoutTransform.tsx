import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import styled from "styled-components"

const transition = { default: { duration: 5 }, scale: { duration: 0.2 } }

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Container
            layout
            transition={transition}
            initial={{ borderRadius: 10 }}
            isOpen={isOpen}
        >
            <Child
                layout
                transition={transition}
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                initial={{ borderRadius: 20 }}
                //whileHover={{ scale: 1.13 }}
                id="child"
            />
        </Container>
    )
}

const Container = styled(motion.div)`
    background: white;
    padding: 20px;
    display: flex;

    ${({ isOpen }) =>
        isOpen
            ? `
        width: 300px;
        height: 200px;
            justify-content: flex-end;`
            : `
            align-items: flex-end;
        width: 200px;
        height: 400px;
    `}
`

const Child = styled(motion.div)`
    background: rgb(255, 0, 136);
    cursor: pointer;
    ${({ isOpen }) =>
        isOpen
            ? `
            width: 30px;
        height: 30px;`
            : `
            width: 100%;
        height: 40px;
    `}
`
