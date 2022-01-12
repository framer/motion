import { render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../"
import { useMotionValue } from "../use-motion-value"
import { useTransform } from "../use-transform"
import { MotionValue, motionValue } from ".."

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
            const y = useTransform(x, (v) => -v)
            return <motion.div style={{ x, y }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(100px) translateY(-100px) translateZ(0)"
        )
    })
})

describe("as function with multiple values", () => {
    test("sets initial value", async () => {
        const Component = () => {
            const x = useMotionValue(4)
            const y = useMotionValue("5px")
            const z = useTransform(
                [x, y],
                ([latestX, latestY]: [number, string]) =>
                    latestX * parseFloat(latestY)
            )
            return <motion.div style={{ x, y, z }} />
        }

        const { container } = render(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(4px) translateY(5px) translateZ(20px)"
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

            React.useEffect(() => {
                x.set(20)
            }, [])

            return <motion.div style={{ x, opacity }} />
        }

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.1")
    })

    test("updates when values change", async (resolve) => {
        const x = motionValue(20)
        let o = motionValue(0)
        const Component = ({ a = 0, b = 100, c = 0, d = 1 }: any) => {
            const opacity = useTransform(x, [a, b], [c, d])
            o = opacity
            return <motion.div style={{ x, opacity }} />
        }

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        expect(container.firstChild).toHaveStyle("opacity: 0.2")
        rerender(<Component b={50} />)
        rerender(<Component b={50} />)
        expect(container.firstChild).toHaveStyle("opacity: 0.4")
        rerender(<Component b={50} d={0.5} />)
        rerender(<Component b={50} d={0.5} />)
        expect(container.firstChild).toHaveStyle("opacity: 0.2")
        x.set(40)

        setTimeout(() => {
            expect(o.get()).toBe(0.4)
            resolve()
        }, 20)
    })

    test("detects custom mixer on value type", async () => {
        const Component = () => {
            const x = useMotionValue(100)
            const y = useTransform(
                x,
                [0, 200],
                [new Custom(100), new Custom(200)]
            )

            React.useEffect(() => {
                x.set(20)
            }, [])

            return <motion.div style={{ x, y }} />
        }

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        expect(container.firstChild).toHaveStyle(
            "transform: translateX(20px) translateY(120px) translateZ(0)"
        )
    })
})

test("is correctly typed", async () => {
    const Component = () => {
        const x = useMotionValue(0)
        const y = useTransform(x, [0, 1], ["0px", "1px"])
        const z = useTransform(x, (v) => v * 2)
        return <motion.div style={{ x, y, z }} />
    }

    render(<Component />)
})

test("can be re-pointed to another `MotionValue`", async () => {
    const a = motionValue(1)
    const b = motionValue(2)
    let x = motionValue(0)

    const Component = ({ target }: { target: MotionValue<number> }) => {
        x = useTransform(target, [0, 1], [0, 2], { clamp: false })
        return <motion.div style={{ x }} />
    }

    const { container, rerender } = render(<Component target={a} />)
    rerender(<Component target={b} />)
    expect(container.firstChild as Element).toHaveStyle(
        "transform: translateX(4px) translateZ(0)"
    )

    rerender(<Component target={a} />)
    expect(container.firstChild as Element).toHaveStyle(
        "transform: translateX(2px) translateZ(0)"
    )
})
