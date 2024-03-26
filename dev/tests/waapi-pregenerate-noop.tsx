import { motion } from "framer-motion"
import * as React from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;

    #box {
        width: 100px;
        height: 100px;
        position: relative;
        background-color: red;
        opacity: 1;
    }
`

export const App = () => {
    return (
        <Container>
            <motion.div
                id="box"
                transition={{
                    duration: 0.5,
                    delay: 2,
                    ease: (x: number) => x,
                }}
                initial={{ transform: "scale(1)" }}
                animate={{ transform: "scale(1)" }}
            >
                Content
            </motion.div>
        </Container>
    )
}
