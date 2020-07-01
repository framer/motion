import * as React from "react"
import { useState } from "react"
import { motion, AnimateSharedLayout, AnimatePresence } from "@framer"
import styled from "styled-components"

/**
 * This demonstrates AnimateSharedLayout children animating correctly
 * when children of AnimatePresence exit/enter
 * TODO: Currently, the child in AnimatePresence is used as part
 * of the layout measurements
 */

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
    margin-right: 0px;

    ${({ isOpen }) =>
        isOpen
            ? `
        width: 200px;
        justify-content: center;
    `
            : `
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

const ContentRow = styled(motion.div)`
    width: 200px;
    height: 8px;
    background-color: #999;
    border-radius: 10px;
    margin-top: 12px;
`

export const App = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AnimateSharedLayout>
            <Container>
                <Popup animate onClick={() => setIsOpen(!isOpen)} id="popup">
                    <Icon id="icon" isOpen={isOpen} animate>
                        <Detail animate id="detail" />
                    </Icon>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                id="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <ContentRow />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Popup>
            </Container>
        </AnimateSharedLayout>
    )
}
