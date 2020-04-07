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
    border-radius: 25px;
`

const Container = styled(motion.div)`
    background-color: rgba(214, 214, 214, 0.5);
    border-radius: 10px;
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

function Item({ isOpen, onClick, i }: ItemProps) {
    return (
        <Container
            animate
            onClick={onClick}
            transition={{ duration: 2 }}
            isOpen={isOpen}
            id="container"
        >
            <Image id="image" animate transition={{ duration: 2 }} />
            <AnimatePresence>
                {isOpen && (
                    <motion.div animate>
                        <ContentRow
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <ContentRow
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <ContentRow
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    )
}

const items = [0] //, 1, 2]
export const App = () => {
    const [open, setIsOpen] = useState<false | number>(false)

    return (
        <AnimateSharedLayout>
            <List animate>
                {items.map(id => (
                    <Item
                        key={id}
                        isOpen={open === id}
                        onClick={() => setIsOpen(open === id ? false : id)}
                        i={id}
                    />
                ))}
            </List>
        </AnimateSharedLayout>
    )
}
