import { motion, animate } from "framer-motion"
import * as React from "react"
import { useEffect, useState } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 100px;

    #box {
        width: 100px;
        height: 100px;
        background-color: red;
        opacity: 0;
    }
`

export const App = () => {
    useEffect(() => {
        const controls = animate("#box", { opacity: [0, 1] }, { duration: 1 })

        controls.cancel()
        controls.complete()
    }, [])

    return (
        <Container>
            <div id="box" />
        </Container>
    )
}
