import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"
import { useState } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    top: 100px;
    left: 100px;

    div {
        width: 100px;
        height: 100px;
        background-color: red;
    }
`

export const App = () => {
    const [state, setState] = useState(true)

    return (
        <Container onClick={() => setState(!state)}>
            <AnimatePresence pop>
                {state ? (
                    <motion.div
                        key="a"
                        id="a"
                        animate={{
                            opacity: 1,
                            transition: { duration: 0.001 },
                        }}
                        exit={{ opacity: 0, transition: { duration: 10 } }}
                        layout
                    />
                ) : null}
                <motion.div
                    key="b"
                    id="b"
                    layout
                    transition={{ ease: () => 1 }}
                />
            </AnimatePresence>
        </Container>
    )
}
