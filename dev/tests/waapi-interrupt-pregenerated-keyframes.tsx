import { motion, animate } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"
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
    const [state, setState] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setState(!state)
        }, 50)

        return () => {
            clearTimeout(timer)
        }
    }, [])

    return (
        <Container>
            <motion.div
                id="box"
                transition={{ type: "spring" }}
                initial={{ clipPath: "inset(0px)" }}
                animate={{ clipPath: state ? "inset(0px)" : "inset(20px)" }}
            >
                Content
            </motion.div>
        </Container>
    )
}
