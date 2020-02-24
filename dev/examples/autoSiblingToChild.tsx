import * as React from "react"
import { motion, useCycle } from "@framer"
import styled from "styled-components"
import { SyncLayout } from "../../src/components/SyncLayout"

const Container = styled.div`
    width: 200px;
    height: 340px;
    overflow: visible;
    background-color: #f3f3f3;
    border-radius: 20px;
    position: relative;
`

const Small = styled(motion.div)`
    width: 60px;
    height: 60px;
    overflow: visible;
    border-radius: 10px;
    position: absolute;

    ${({ purple }) =>
        purple
            ? `
      background-color: #85f;
      top: 30px;
      left: 30px;
    `
            : `
      background-color: #0099ff;
      top: 172px;
      left: 102px;
    `}
`
const Big = styled(motion.div)`
    overflow: visible;
    position: absolute;

    ${({ purple }) =>
        purple
            ? `
            top: 137px;
            left: 26px;
            width: 120px;
            height: 120px;
          background-color: rgba(136, 85, 255, 0.3); 
          border-radius: 20px;
    `
            : `
            top: 110px;
            left: 40px;
            width: 60px;
            height: 60px;
           background-color: rgba(0, 153, 255, 0.3);
           border-radius: 10px;
    `}
`

const Child = () => {
    return (
        <Big auto autoId="big" purple>
            <Small auto autoId="small" purple />
        </Big>
    )
}

const Sibling = () => {
    return (
        <>
            <Big auto autoId="big" />
            <Small auto autoId="small" />
        </>
    )
}

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()}>
            <SyncLayout>{isOn ? <Child /> : <Sibling />}</SyncLayout>
        </Container>
    )
}
