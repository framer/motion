import * as React from "react"
import { useState } from "react"
import { motion, useTransformedValue, useMotionValue } from "@framer"
import styled from "styled-components"

const Slider = styled(motion.div)`
    background-color: #272727;
    color: rgba(255, 255, 255, 0.8);
    position: absolute;
    height: 200px;
    width: 400px;
`

function pointRelativeTo(id: string | HTMLElement) {
    let elem: HTMLElement

    function getElem() {
        if (elem) return elem
        if (typeof id === "string") {
            elem = document.getElementById(id)
        } else {
            elem = id
        }
    }
    return ({ x, y }) => {
        const localElem = getElem()

        if (!localElem) return undefined
        const rect = localElem.getBoundingClientRect()

        return {
            x: x - rect.left - localElem.scrollLeft,
            y: y - rect.top - localElem.scrollTop,
        }
    }
}
const convert = pointRelativeTo("slider")

export const App = () => {
    const [point, setPoint] = useState({ x: 0, y: 0 })
    return (
        <div style={{ position: "absolute", left: 100, top: 204 }}>
            <Slider onPan={(e, info) => setPoint(info.point)} id="slider">
                {JSON.stringify(convert(point))}
            </Slider>
        </div>
    )
}
