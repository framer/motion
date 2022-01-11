import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import styled from "styled-components"

/**
 * This demonstrates child scale correction working through a muggle motion
 * component.
 */
const transition = { duration: 10 }
export const App = () => {
    const [isOn, setIsOn] = useState(false)

    // Double render to ensure it doesn't matter if we trigger a animate transition mid-animation
    React.useEffect(() => {
        isOn && setTimeout(() => setIsOn(isOn), 500)
    }, [isOn])

    return (
        <Box
            layout
            isOn={isOn}
            onClick={() => setIsOn(!isOn)}
            transition={transition}
        >
            <motion.div>
                <JitterBox layout transition={transition} />
            </motion.div>
        </Box>
    )
}

const Box = styled(motion.div)`
    background: white;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;

    ${({ isOn }: { isOn: boolean }) => {
        return isOn
            ? `
          width: 500px;
          height: 500px;`
            : `
          width: 200px;
          height: 200px;`
    }}
`

const JitterBox = styled(motion.div)`
    background: red;
    width: 100px;
    height: 100px;
`
