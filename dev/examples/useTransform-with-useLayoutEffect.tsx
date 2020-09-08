import React, { useRef, useState, useLayoutEffect, useEffect } from "react"
import { motion, useTransform, useViewportScroll } from "@framer"
import styled from "styled-components"

const PrevElements = styled.div`
    height: 400vh;
    background-color: lightblue;
`

const Container = styled.div`
    height: 200vh;
    width: 100vw;
`

const Background = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100vh;
    position: relative;
`

export function App() {
    const [elementTop, setElementTop] = useState(0)
    const ref = useRef(null)
    const { scrollY } = useViewportScroll()

    useLayoutEffect(() => {
        if (!ref.current) return
        setElementTop(ref.current.offsetTop)
    }, [ref])

    const opacity = useTransform(
        scrollY,
        [elementTop, elementTop + 600],
        [1, 0]
    )

    useEffect(() => {
        const log = () => {
            console.log(elementTop, scrollY.current, opacity.current)
        }
        window.addEventListener("scroll", log)
        return () => window.removeEventListener("scroll", log)
    }, [elementTop, scrollY, opacity])

    return (
        <>
            <PrevElements />
            <Container ref={ref}>
                <motion.div
                    initial={{ background: "#f9cb29" }}
                    style={{
                        opacity,
                    }}
                >
                    <Background>Hi!</Background>
                </motion.div>
            </Container>
        </>
    )
}
