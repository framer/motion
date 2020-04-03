import * as React from "react"
import { motion, useCycle, MotionPlugins, SharedMagicMotion } from "@framer"
import { mix } from "@popmotion/popcorn"
import styled from "styled-components"

/**
 * This demo is called "Framer border" because it demonstrates border animations as Framer
 * implements borders, by positioning the inner div seperately to the sized outer Frame using `inset`
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

const borderWidth = (axis: "x" | "y", key: string) => ({
    read: width => (width ? parseFloat(width) : 0),
    createUpdater: (values, origin, target, current, delta, treeScale) => {
        if (!(origin || target)) return

        const motionValue = values.get(key, "")

        return p => {
            const v = mix(origin, target, p)
            current[key] = v

            const correctedWidth = v / delta[axis].scale / treeScale[axis]
            motionValue.set(correctedWidth)
        }
    },
})

const xBorder = (key: string) => borderWidth("x", key)
const yBorder = (key: string) => borderWidth("y", key)

const border = {
    borderColor: {},
    borderTopWidth: yBorder("borderTopWidth"),
    borderLeftWidth: xBorder("borderLeftWidth"),
    borderRightWidth: xBorder("borderRightWidth"),
    borderBottomWidth: yBorder("borderBottomWidth"),
}

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <MotionPlugins magicValues={border}>
            <SharedMagicMotion transition={{ duration: 3, ease: "circIn" }}>
                <Container magic onClick={() => toggleOn()} isOn={isOn}>
                    <motion.div
                        magic
                        style={
                            true
                                ? {
                                      borderColor: "#8855FF",
                                      borderTopWidth: 5,
                                      borderRightWidth: "5px",
                                      borderLeftWidth: 5,
                                      borderBottomWidth: 30,
                                  }
                                : {
                                      borderColor: "#09f",
                                      borderTopWidth: 50,
                                      borderRightWidth: "50px",
                                      borderLeftWidth: 50,
                                      borderBottomWidth: 50,
                                  }
                        }
                    />
                </Container>
            </SharedMagicMotion>
        </MotionPlugins>
    )
}
