import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence, SyncLayout } from "@framer"
import styled from "styled-components"

interface ItemProps {
    isOpen: boolean
    onClick: () => void
}

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

const ContentRow = styled(motion.div)`
    width: 200px;
    height: 8px;
    background-color: #999;
    border-radius: 10px;
    margin-top: 12px;
`

function Item({ isOpen, onClick }: ItemProps) {
    return (
        <Container auto onClick={onClick}>
            <Image auto />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        auto
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

const items = [0, 1, 2]
export const App = () => {
    const [open, setIsOpen] = useState<false | number>(false)

    return (
        <SyncLayout>
            <List auto>
                {items.map(id => (
                    <Item
                        key={id}
                        isOpen={open === id}
                        onClick={() => setIsOpen(open === id ? false : id)}
                    />
                ))}
            </List>
        </SyncLayout>
    )
}
