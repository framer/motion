import * as React from "react"
import { motion, useCycle, AnimateSharedLayout, AnimatePresence } from "@framer"
import styled from "styled-components"

/**
 * This example demonstrates using AnimateSharedLayout
 * to animate between two sets of two components with a different
 * hierarchy
 */

const Container = styled.div`
    width: 200px;
    height: 340px;
    overflow: visible;
    background-color: #f3f3f3;
    border-radius: 20px;
    position: relative;
`

const Small = styled(motion.div)`
    width: 150px;
    height: 150px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    user-select: none;
    overflow: visible;
    border-radius: 10px;
    position: absolute;

    ${({ purple }) =>
        purple
            ? `
      background-color: #85f;
      top: 64px;
      left: 124px;
    `
            : `
      background-color: #0099ff;
      top: 15px;
      left: 15px;
    `}
`

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()}>
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence>
                    {isOn ? (
                        <Small key="a" debugId="a" layoutId="letter">
                            A
                        </Small>
                    ) : (
                        <Small key="b" debugId="b" layoutId="letter">
                            B
                        </Small>
                    )}
                </AnimatePresence>
            </AnimateSharedLayout>
        </Container>
    )
}
