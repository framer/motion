import * as React from "react"
import { motion, useCycle } from "framer-motion"
import styled from "styled-components"

const Container = styled.div`
    p {
        color: white;
        font-weight: bold;
        font-family: Helvetica;
    }
`
export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()}>
            <motion.p layout style={{ fontSize: isOn ? 100 : 24 }}>
                TEXT
            </motion.p>
        </Container>
    )
}
