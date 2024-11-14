import { animateMini, stagger } from "framer-motion"
import { useEffect } from "react"
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
        const controls = animateMini(
            "#box",
            { opacity: [0, 1] },
            { duration: 0.2, delay: stagger(0.1) }
        )

        return () => controls.stop()
    }, [])

    return (
        <Container>
            <div id="box" />
        </Container>
    )
}
