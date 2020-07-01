import * as React from "react"
import { motion, useCycle, AnimateSharedLayout } from "@framer"
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
    width: 50px;
    height: 50px;
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
const Big = styled(motion.div)`
    width: 148px;
    height: 148px;
    overflow: visible;
    border-radius: 20px;
    position: absolute;

    ${({ purple }) =>
        purple
            ? `
            top: 137px;
            left: 26px;
          background-color: rgba(136, 85, 255, 0.3);
    `
            : `
            top: 97px;
            left: 26px;
          background-color: rgba(0, 153, 255, 0.3);
    `}
`

const Child = () => {
    return (
        <Big animate layoutId="big">
            <Small animate layoutId="small" />
        </Big>
    )
}

const Sibling = () => {
    return (
        <>
            <Big animate layoutId="big" purple />
            <Small animate layoutId="small" purple />
        </>
    )
}

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()}>
            <AnimateSharedLayout>
                {isOn ? <Child /> : <Sibling />}
            </AnimateSharedLayout>
        </Container>
    )
}
