import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
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

/**
 * This example replicates the centering technique of Framer which applies a `transformTemplate` prop
 * that adds `transform(-50% -50%)`
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    return (
        <SwitchContainer
            isOn={isOn}
            onClick={() => setIsOn(!isOn)}
            transformTemplate={(_, generated) =>
                `translate(-50%, -50%) ${generated}`
            }
            layout
        >
            <Switch isOn={isOn} layout />
        </SwitchContainer>
    )
}
