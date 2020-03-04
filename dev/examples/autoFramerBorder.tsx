import * as React from "react"
import { motion, useCycle } from "@framer"
import styled from "styled-components"

/**
 * This demo is called "Framer border" because it demonstrates border animations as Framer
 * implements borders, by positioning the inner div seperately to the sized outer Frame using `inset`
 */

const Container = styled.div<{ isOn: boolean }>`
    display: block;
    height: 350px;
    width: 350px;
    position: relative;
    background: white;

    div {
        position: absolute;
        inset: 0px;

        border: ${({ isOn }) =>
            isOn ? `30px solid #8855FF` : `10px solid #09f`};
    }
`
export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()} isOn={isOn}>
            <motion.div magic />
        </Container>
    )
}
