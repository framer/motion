import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, MagicMotion } from "@framer"
import styled from "styled-components"

interface ItemProps {
    isOpen: boolean
    onClick: () => void
}

const Container = styled(motion.div)`
    border-radius: 10px;
    position: absolute;
    bottom: 20px;
    right: 20px;
    overflow: hidden;
    background: #eee;
    padding: 10px;
    box-sizing: border-box;
    ${({ isOpen }) =>
        isOpen
            ? `
    width: 340px;
    height: 380px;
    padding: 20px;
    `
            : `
    width: 60px;
    height: 60px;
  `}
`

const Icon = styled(motion.div)`
    width: 40px;
    height: 40px;
    background-color: #666;
    border-radius: 20px;
`

const Content = styled(motion.div)`
    position: absolute;
    opacity: ${({ isOpen }) => (isOpen ? `1` : `0`)};
    width: 340px;
    bottom: 20px;
`

const ContentRow = styled.div`
    width: 100%;
    height: 8px;
    background-color: #999;
    border-radius: 10px;
    margin-top: 12px;
`

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Container magic isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
            <Icon isOpen={isOpen} magic />
            <Content magic isOpen={isOpen}>
                <ContentRow />
                <ContentRow />
                <ContentRow />
            </Content>
        </Container>
    )
}
