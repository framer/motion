import "../../../jest.setup"
import { render } from "@testing-library/react"
import * as React from "react"
import { motion } from "../../motion"
import { useInvertedScale } from "../use-inverted-scale"
import { motionValue } from ".."

describe("useInvertedScale", () => {
    test("Provides motion values that are the inverse of their parent's scale", () => {
        const Child = () => {
            const { scaleX, scaleY } = useInvertedScale()
            expect([scaleX.get(), scaleY.get()]).toEqual([0.5, 2])
            return null
        }

        const Component = () => {
            return (
                <motion.div style={{ scaleX: 2, scaleY: 0.5 }}>
                    <Child />
                </motion.div>
            )
        }

        render(<Component />)
    })

    test("Provides motion values that are the inverse of the provided scale", () => {
        const parent = { scaleX: motionValue(0.5), scaleY: motionValue(2) }

        const Child = () => {
            const { scaleX, scaleY } = useInvertedScale(parent)
            expect([scaleX.get(), scaleY.get()]).toEqual([2, 0.5])
            return null
        }

        const Component = () => {
            return (
                <motion.div style={{ scaleX: 2, scaleY: 0.5 }}>
                    <Child />
                </motion.div>
            )
        }

        render(<Component />)
    })

    test("Sensibly handles inverse of 0", () => {
        const Child = () => {
            const { scaleX } = useInvertedScale()
            expect(scaleX.get()).toEqual(100000)
            return null
        }

        const Component = () => {
            return (
                <motion.div style={{ scaleX: 0 }}>
                    <Child />
                </motion.div>
            )
        }

        render(<Component />)
    })
})
