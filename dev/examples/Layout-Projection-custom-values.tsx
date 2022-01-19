import * as React from "react"
import { useState } from "react"
import { motion, addScaleCorrector } from "framer-motion"
import { mix } from "popmotion"
import styled from "styled-components"

/**
 * This demo is called "Framer border" because it demonstrates border animations as Framer
 * implements borders, by positioning the inner div seperately to the sized outer Frame using `inset`
 * and defining additional values with handlers passed to `autoValues`.
 */

const Container = styled(motion.div)<{ isOn: boolean }>`
    display: block;
    position: relative;
    background: white;

    ${({ isOn }) => `
        width: ${isOn ? 700 : 100}px;
        height: ${isOn ? 400 : 100}px;
        `}

    div {
        position: absolute;
        inset: 0px;
        border-style: solid;
    }
`

const borderWidth = (axis: "x" | "y") => ({
    correct: (latest: any, { targetDelta, treeScale }: any) => {
        return latest / targetDelta[axis].scale / treeScale[axis] + "px"
    },
})

const xBorder = () => borderWidth("x")
const yBorder = () => borderWidth("y")

const border = {
    borderTopWidth: yBorder(),
    borderLeftWidth: xBorder(),
    borderRightWidth: xBorder(),
    borderBottomWidth: yBorder(),
}

export const App = () => {
    const [isOn, setOn] = useState(false)

    React.useEffect(() => {
        addScaleCorrector(border)
    }, [])

    return (
        <Container
            layout
            transition={{ duration: 3, ease: "circIn" }}
            onClick={() => setOn(!isOn)}
            isOn={isOn}
        >
            <motion.div
                layout
                initial={false}
                animate={
                    isOn
                        ? {
                              borderColor: "#000",
                              borderTopWidth: 5,
                              borderRightWidth: 5,
                              borderLeftWidth: 5,
                              borderBottomWidth: 30,
                          }
                        : {
                              borderColor: "#90f",
                              borderTopWidth: 50,
                              borderRightWidth: 50,
                              borderLeftWidth: 50,
                              borderBottomWidth: 50,
                          }
                }
                transition={{ duration: 3, ease: "circIn" }}
            />
        </Container>
    )
}
