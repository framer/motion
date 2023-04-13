import { render } from "../../../jest.setup"
import * as React from "react"
import { motion } from "../../render/dom/motion"
import { motionValue } from "../../value"
import { frame } from "../../frameloop"

describe("child as motion value", () => {
    test("accepts motion values as children", async () => {
        const promise = new Promise<HTMLDivElement>((resolve) => {
            const child = motionValue(1)
            const Component = () => <motion.div>{child}</motion.div>
            const { container, rerender } = render(<Component />)
            rerender(<Component />)
            resolve(container.firstChild as HTMLDivElement)
        })

        return expect(promise).resolves.toHaveTextContent("1")
    })

    test("updates textContent when motion value changes", async () => {
        const promise = new Promise<HTMLDivElement>((resolve) => {
            const child = motionValue(1)
            const Component = () => <motion.div>{child}</motion.div>
            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            frame.postRender(() => {
                child.set(2)

                frame.postRender(() => {
                    resolve(container.firstChild as HTMLDivElement)
                })
            })
        })

        return expect(promise).resolves.toHaveTextContent("2")
    })
})
