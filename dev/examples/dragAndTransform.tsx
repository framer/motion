import * as React from "react"
import { useState } from "react"
import { motion, useTransform, useMotionValue } from "@framer"
import styled from "styled-components"

const Container = styled(motion.div)`
    position: relative;
    width: 300px;
    height: 100px;
    pointer-events: auto;
    transform-origin: 50% 50% 0px;
    padding-left: 32px;
    padding-right: 32px;
    box-sizing: border-box;
    display: grid;
    align-items: center;
    text-align: center;
    border-radius: 5px;
    box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.2);
`

const Dot = styled(motion.div)`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: white;
`

const Slider = styled(motion.div)`
    cursor: -webkit-grab;
    background-color: #272727;
    color: rgba(255, 255, 255, 0.8);
    position: absolute;
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    text-align: center;
    border-radius: 5px;
    box-shadow: 0px 10px 30px -5px rgba(0, 0, 0, 0.2);
    font-size: 3em;
    font-weight: 800;
    transition: box-shadow 0.75s;

    & > * {
        pointer-events: none;
    }

    &:active {
        cursor: -webkit-grabbing;
        box-shadow: 0px 60px 50px -5px rgba(0, 0, 0, 0.4);
    }
`

const containerPoses = {
    default: { rotateX: 0 },
    dragging: { rotateX: 45 },
}

const sliderPoses = {
    default: { x: 0, y: 0, scale: 1 },
    dragging: { y: -30, scale: 1.15 },
}

export const App = () => {
    const [down, setDown] = useState(false)
    const x = useMotionValue(0)
    const background = useTransform(
        x,
        [-50, 50],
        [
            "linear-gradient(120deg, #f093fb 0%, #f5576c 100%)",
            "linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)",
        ]
    )
    const dotScale = useTransform(x, [-300, -50, 50, 300], [1, 0.5, 0.5, 1])

    return (
        <Container
            pose={down ? "dragging" : "default"}
            animate={containerPoses}
            style={{ background }}
        >
            <Dot />
            <Slider
                animate={sliderPoses}
                inherit
                style={{ x }}
                onMouseDown={() => (console.log("yo"), setDown(true))}
                onMouseUp={() => setDown(false)}
                //onPanStart={() => console.log("yo")}
            >
                Slide
            </Slider>
        </Container>
    )
}
