import * as React from "react"
import { useState } from "react"
import { motion, useCycle, SharedMagicMotion } from "@framer"
import styled from "styled-components"

/**
 * This demo is intended to demonstrate `MagicMotion` working with `animate` without any
 * visual flickering
 */
const transition = { duration: 10 }
export const App = () => {
    const [isOn, setIsOn] = useState(false)

    // Double render to ensure it doesn't matter if we trigger a magic transition mid-animation
    React.useEffect(() => {
        isOn && setTimeout(() => setIsOn(isOn), 500)
    }, [isOn])

    return (
        <Container isOn={isOn} onClick={() => setIsOn(!isOn)}>
            <Box magic transition={transition}>
                <JitterBox
                    magic
                    transition={transition}
                    onUpdate={({ x }) => console.log("x is", x)} // should always be 0
                />
            </Box>
        </Container>
    )
}

const Container = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    ${({ isOn }: { isOn: boolean }) => {
        return isOn
            ? `
        justify-content: flex-start;
        align-items: flex-start;`
            : `
        justify-content: center;
        align-items: center;`
    }}
`

const Box = styled(motion.div)`
    background: white;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const JitterBox = styled(motion.div)`
    background: red;
    width: 100px;
    height: 100px;
`
