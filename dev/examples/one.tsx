import { motion } from "framer-motion"
import * as React from "react"
import styled from "styled-components"

const Box = styled(motion.div)`
    width: 100px;
    height: 100px;
    background-color: white;
`

/**
 * An example of creating a `motion` version of a custom element. This will render <global> into the HTML
 */

export const App = () => {
    return <Box data-test="hello" />
}
