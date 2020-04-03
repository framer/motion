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
    border-radius: 100px;
    padding: 10px;

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
            sharedId="switch"
            onClick={() => toggleOn()}
            magic
            style={{ backgroundColor: isOn ? "#09f" : "#bbb" }}
        >
            <motion.div magic sharedId="handle" />
        </Container>
    )
}
