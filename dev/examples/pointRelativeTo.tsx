import * as React from "react"
import { useState } from "react"
import { motion, Point } from "../../src"
import styled from "styled-components"

const Slider = styled(motion.div)`
    background-color: #272727;
    color: rgba(255, 255, 255, 0.8);
    position: absolute;
    height: 200px;
    width: 400px;
`

const convert1 = Point.pointRelativeTo("slider1")
const convert2 = Point.pointRelativeTo("slider2")

export const App = () => {
    const [point, setPoint] = useState({ x: 0, y: 0 })
    return (
        <div style={{ position: "absolute", left: 100, top: 204 }}>
            <Slider onPan={(e, info) => setPoint(info.point)} id="slider1">
                {JSON.stringify(convert1(point))}
            </Slider>
            <div
                style={{ height: 20000, width: 300, backgroundColor: "tomato" }}
            />
            <Slider onPan={(e, info) => setPoint(info.point)} id="slider2">
                {JSON.stringify(convert2(point))}
            </Slider>
        </div>
    )
}
