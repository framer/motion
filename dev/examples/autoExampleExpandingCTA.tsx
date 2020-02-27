import * as React from "react"
import { useState } from "react"
import { motion, SyncLayout } from "@framer"
import styled from "styled-components"

const Container = styled.div`
    position: absolute;
    top: 0;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
`

const Popup = styled(motion.div)`
    border-radius: 10px;
    overflow: hidden;
    background: #eee;
    display: flex;
    padding: 15px;
`

const Icon = styled(motion.div)`
    background-color: #666;
    border-radius: 50px;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;

    ${({ isOpen }) =>
        isOpen
            ? `
        margin-right: 300px;
        width: 200px;
        justify-content: center;
    `
            : `
        margin-right: 0px;
        justify-content: flex-end;
    `}
`

const Detail = styled(motion.div)`
    margin: 10px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background: red;
`
const transition = { duration: 10, ease: "circIn" }
export const App = () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Container>
            <SyncLayout>
                <Popup
                    auto
                    onClick={() => setIsOpen(!isOpen)}
                    transition={transition}
                >
                    <Icon isOpen={isOpen} auto transition={transition}>
                        <Detail auto transition={transition} />
                    </Icon>
                    {/* <AnimatePresence>
                        {isOpen && (
                            <ContentRow
                                auto
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </AnimatePresence> */}
                </Popup>
            </SyncLayout>
        </Container>
    )
}
