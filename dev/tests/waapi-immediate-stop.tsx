import { motionValue, AcceleratedAnimation } from "framer-motion"
import * as React from "react"
import { useEffect, useRef } from "react"
import styled from "styled-components"

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 100px;

    #box {
        width: 100px;
        height: 100px;
        position: relative;
        top: 100px;
        left: 100px;
        background-color: red;
        opacity: 1;
    }
`

export const App = () => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const opacity = motionValue(0)
        ;(opacity as any).owner = { current: ref.current }
        const animation = new AcceleratedAnimation({
            keyframes: [null, 1],
            motionValue: opacity,
            name: "opacity",
        })

        animation.stop()

        // If this animation resolved, that is incorrect
        if (animation._resolved) {
            ref.current.textContent = "Error"
        }

        new AcceleratedAnimation({
            keyframes: [0.4, 0.5],
            motionValue: opacity,
            name: "opacity",
        })

        // Animation shouldn't fail if element is removed before keyframes resolve
        ;(opacity as any).owner.current = undefined
    }, [])

    return (
        <Container>
            <div ref={ref} id="box">
                Content
            </div>
        </Container>
    )
}
