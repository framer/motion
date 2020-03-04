import * as React from "react"
import { motion, useCycle } from "@framer"
import styled from "styled-components"

/**
 * TODO: Not expected to work yet
 */

const Container = styled(motion.div)<{ isOn: boolean }>`
    position: relative;
    width: 200px;
    height: 420px;
    background-image: ${({ isOn }) =>
        isOn
            ? `linear-gradient(180deg, #00e1ff 0%, hsl(204, 100%, 92%) 100%)`
            : `linear-gradient(90deg, #4800ff 0%, hsl(27, 84%, 55%) 100%)`};
`
;`
    border-radius: 10px;
`
export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return <Container onClick={() => toggleOn()} isOn={isOn} magic />
}
