import * as React from "react"
import { useState } from "react"
import { motion, useCycle, MagicMotion } from "@framer"
import styled from "styled-components"

/**
 * This demo is intended to demonstrate `MagicMotion` working with `animate` without any
 * visual flickering
 */

export const App = () => {
    const [isOn, setIsOn] = useState(false)

    // Double render to ensure it doesn't matter if we trigger a magic transition mid-animation
    React.useEffect(() => {
        isOn && setTimeout(() => setIsOn(isOn), 500)
    }, [isOn])

    return (
        <Container onClick={() => setIsOn(!isOn)}>
            {isOn && (
                <Box
                    magic
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 3 }}
                />
            )}
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
`

const Box = styled(motion.div)`
    background: white;
    width: 300px;
    height: 300px;
`
