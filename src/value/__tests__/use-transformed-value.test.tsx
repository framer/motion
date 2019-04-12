import "../../../jest.setup"
import { render } from "react-testing-library"
import * as React from "react"
import { motion } from "../../motion"
import { useMotionValue } from "../use-motion-value"
import { useTransform } from "../use-transform"

class Custom {
    value: number = 0

    constructor(value: number) {
        this.value = value
    }

    get() {
        return this.value
    }

    mix(from: Custom, to: Custom) {
        return (p: number) => from.get() + to.get() * p
    }
}

describe("as function", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const y = useTransform(x, v => -v)
            return <motion.div style={{ x, y }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateY(-100px) translateZ(0)"
        )
    })
})

describe("as input/output range", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const opacity = useTransform(x, [0, 200], [0, 1])
            return <motion.div style={{ x, opacity }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.5")
    })

    test("responds to manual setting from parent value", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const opacity = useTransform(x, [0, 200], [0, 1])

            x.set(20)

            return <motion.div style={{ x, opacity }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.1")
    })

    test("detects custom mixer on value type", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const y = useTransform(
                x,
                [0, 200],
                [new Custom(100), new Custom(200)]
            )

            x.set(20)

            return <motion.div style={{ x, y }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(20px) translateY(120px) translateZ(0)"
        )
    })
})
