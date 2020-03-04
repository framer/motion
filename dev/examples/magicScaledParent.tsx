import * as React from "react"
import { useState } from "react"
import { motion } from "@framer"
import styled from "styled-components"

const SwitchContainer = styled(motion.div)`
    box-sizing: border-box;
    width: 170px;
    height: 100px;
    border-radius: 100px;
    padding: 10px;
    background-color: ${({ isOn }) => (isOn ? `#09f` : "#bbb")};
`

const Switch = styled(motion.div)`
    width: 80px;
    height: 80px;
    background-color: #ffffff;
    border-radius: 200px;
    float: ${({ isOn }) => (isOn ? `right` : "left")};
`

function Device({ children }) {
    return children
}

/**
 * This example replicates the environment of the Framer X preview window. This is scaled
 * and transformed in a way that makes it difficult measure bounding boxes.
 *
 * TODO: This is working in Framer Web because it scales the iframe itself. This demo is not yet
 * functional, we need to add scale and transform in `Device` and then hopefully fix the resultant
 * miscalculations by
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <Device>
            <SwitchContainer isOn={isOn} onClick={() => setIsOn(!isOn)} magic>
                <Switch isOn={isOn} magic />
            </SwitchContainer>
        </Device>
    )
}
