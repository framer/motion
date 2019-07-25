import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { motion } from "../../motion"
import { useInvertedScale } from "../use-inverted-scale"

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

    test("Sensibly handles inverse of 0", () => {
        const Child = () => {
            const { scaleX } = useInvertedScale()
            expect(scaleX.get()).toEqual(10000)
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
