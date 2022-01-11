import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import styled from "styled-components"

const transition = {
    default: { duration: 2, ease: "easeInOut" },
    scale: { duration: 0.2 },
}

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [dragEnabled, setIsDragEnabled] = useState(false)
    const [layoutEnabled, setIsLayoutEnabled] = useState(false)

    React.useEffect(() => {
        const timer = setTimeout(() => setIsOpen(!isOpen), 2000)
        return () => clearTimeout(timer)
    }, [isOpen])

    return (
        <>
            <Container
                layout
                transition={transition}
                initial={{ borderRadius: 10 }}
                isOpen={isOpen}
            >
                <Child
                    layout
                    drag
                    transition={transition}
                    isOpen={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                    initial={{ borderRadius: "50%" }}
                    whileHover={{ scale: 1.13 }}
                    id="child"
                />
            </Container>
            <Settings>{"layout={true} drag={true}"}</Settings>
        </>
    )
}

const Container = styled(motion.div)`
    background: white;
    padding: 20px;
    display: flex;

    ${({ isOpen }) =>
        isOpen
            ? `
        width: 500px;
        height: 100px;
            justify-content: flex-end;`
            : `
            align-items: flex-end;
        width: 200px;
        height: 200px;
    `}
`

const Child = styled(motion.div)`
    background: rgb(255, 0, 136);
    cursor: pointer;
    width: 50px;
    height: 50px;
`

const Settings = styled(motion.div)`
    font-family: Dank Mono;
    color: white;
    font-weight: bold;
    position: fixed;
    bottom: 50px;
    width: 100%;
    text-align: center;
    font-size: 36px;
`
