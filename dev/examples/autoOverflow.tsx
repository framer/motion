import * as React from "react"
import { motion, useCycle } from "@framer"
import styled from "styled-components"

/**
 * This demo is called "Framer border" because it demonstrates border animations as Framer
 * implements borders, by positioning the inner div seperately to the sized outer Frame using `inset`
 */

const Container = styled.div<{ isOn: boolean }>`
    position: relative;
    width: 200px;
    height: 420px;
    background: white;
    overflow: hidden;
    border-radius: 10px;

    div {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .background {
        background: #0099ff;
        opacity: 0.3;
    }

    .clipping {
        height: ${({ isOn }) => (isOn ? "100%" : "20%")};
        overflow: hidden;
    }

    .progress {
        height: 420px;
        background: linear-gradient(180deg, #0099ff 0%, rgb(0, 52, 87) 100%);
    }
`
export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <Container onClick={() => toggleOn()} isOn={isOn}>
            <div className="background" />
            <motion.div auto className="clipping">
                <motion.div auto className="progress" />
            </motion.div>
        </Container>
    )
}
