import * as React from "react"
import { motion, useCycle } from "@framer"
import styled from "styled-components"

interface Props {
    isOn: boolean
}

const Container = styled(motion.div)<Props>`
    box-sizing: border-box;
    width: 170px;
    height: 100px;
    background-color: #bbb;
    border-radius: 100px;
    padding: 10px;

    ${({ isOn }) => isOn && `background-color: #09f`}

    div {
        width: 80px;
        height: 80px;
        background-color: #ffffff;
        border-radius: 200px;
        float: left;

        ${({ isOn }) => isOn && `float:right;`}
    }
`

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container
            isOn={isOn}
            autoId="switch"
            key={isOn}
            onClick={() => toggleOn()}
            auto
        >
            <motion.div auto autoId="handle" />
        </Container>
    )
}
