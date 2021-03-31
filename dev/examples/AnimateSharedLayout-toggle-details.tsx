import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, AnimateSharedLayout } from "@framer"
import styled from "styled-components"

/**
 * This demonstrates container components correctly animating
 * resize when children are added/removed/expanded
 */

interface ItemProps {
    isOpen: boolean
    onClick: () => void
    i: number
}

const ContentRow = styled(motion.div)`
    width: 200px;
    height: 8px;
    background-color: #999;
    border-radius: 10px;
    margin-top: 12px;
`
const List = styled(motion.div)`
    width: 240px;
    display: flex;
    flex-direction: column;
    background: white;
    padding: 20px;
`

const Container = styled(motion.div)`
    background-color: rgba(214, 214, 214, 0.5);
    padding: 20px;
    margin-bottom: 20px;
    overflow: hidden;

    &:last-child {
        margin-bottom: 0px;
    }
`

const Image = styled(motion.div)`
    width: 40px;
    height: 40px;
    background-color: #666;
    border-radius: 20px;
`

function Item({ onClick, i }: ItemProps) {
    const [isOpen, setIsOpen] = useState<false | number>(0)

    return (
        <Container
            layout
            onClick={() => setIsOpen(!isOpen)}
            isOpen={isOpen}
            id={`container-${i}`}
            style={{ borderRadius: 10 }}
        >
            <Image id={`image-${i}`} layout />
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ContentRow />
                        <ContentRow />
                        <ContentRow />
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    )
}

const Component = () => {
    return (
        <List
            initial={{ borderRadius: 25 }}
            layout
            style={{ borderRadius: 25 }}
            id="container"
        >
            {items.map((id) => (
                <Item key={id} i={id} />
            ))}
        </List>
    )
}

const items = [0, 1, 2]
export const App = () => {
    return (
        <AnimateSharedLayout>
            <Component />
        </AnimateSharedLayout>
    )
}
