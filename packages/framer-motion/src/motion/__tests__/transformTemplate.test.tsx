import { render } from "../../../jest.setup"
import { motion } from "../../"
import * as React from "react"
import { sync } from "../../frameloop"

describe("transformTemplate", () => {
    it("applies transformTemplate on initial render", () => {
        const { container } = render(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) =>
                    `translateY(${x}) ${generated}`
                }
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(10px) translateX(10px) translateZ(0)"
        )
    })

    it("applies updated transformTemplate", () => {
        const { container, rerender } = render(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) =>
                    `translateY(${x}) ${generated}`
                }
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(10px) translateX(10px) translateZ(0)"
        )

        rerender(
            <motion.div
                initial={{ x: 10 }}
                transformTemplate={({ x }, generated) => {
                    const newX = typeof x === "string" ? parseFloat(x) : x
                    return `translateY(${(newX as number) * 2}px) ${generated}`
                }}
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(20px) translateX(10px) translateZ(0)"
        )
    })

    it("renders transform with transformTemplate", () => {
        const { container } = render(
            <motion.div
                transformTemplate={(_, generated) =>
                    `translateY(20px) ${generated}`
                }
                style={{ x: 10 }}
            />
        )
        expect(container.firstChild).toHaveStyle(
            "transform: translateY(20px) translateX(10px) translateZ(0)"
        )
    })

    it("renders transformTemplate without any transform", () => {
        const { container } = render(
            <motion.div transformTemplate={() => `translateY(20px)`} />
        )
        expect(container.firstChild).toHaveStyle("transform: translateY(20px)")
    })

    it("removes transformTemplate if prop is removed and transform is changed", async () => {
        const { container, rerender } = render(
            <motion.div
                transformTemplate={() => `translateY(20px)`}
                style={{ x: 10 }}
            />
        )
        expect(container.firstChild).toHaveStyle("transform: translateY(20px)")
        rerender(<motion.div style={{ x: 20 }} />)

        await new Promise((resolve) => sync.postRender(resolve))

        expect(container.firstChild).toHaveStyle(
            "transform: translateX(20px) translateZ(0)"
        )
    })

    it("removes transformTemplate if prop is removed and transform is not changed", async () => {
        const { container, rerender } = render(
            <motion.div
                transformTemplate={() => `translateY(20px)`}
                style={{ x: 10 }}
            />
        )
        expect(container.firstChild).toHaveStyle("transform: translateY(20px)")
        rerender(<motion.div style={{ x: 10 }} />)

        await new Promise((resolve) => sync.postRender(resolve))

        expect(container.firstChild).toHaveStyle(
            "transform: translateX(10px) translateZ(0)"
        )
    })

    it("removes transformTemplate if prop is removed", async () => {
        const { container, rerender } = render(
            <motion.div transformTemplate={() => `translateY(20px)`} />
        )
        expect(container.firstChild).toHaveStyle("transform: translateY(20px)")
        rerender(<motion.div />)

        await new Promise((resolve) => sync.postRender(resolve))

        expect(container.firstChild).toHaveStyle("transform: none")
    })
})
