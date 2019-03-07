import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from ".."
import * as React from "react"

describe("custom values plugin", () => {
    test("renders", () => {
        const Component = () => {
            return <motion.div style={{ size: "100%" }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("width: 100%; height: 100%;")
    })

    test("adds a url if it does not exist yet", () => {
        const Component = () => {
            return <motion.div style={{ image: "image.jpg" }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle(
            "background-image: url(image.jpg); "
        )
    })
    test("adds background-size: cover", () => {
        const Component = () => {
            return <motion.div style={{ image: "image.jpg" }} />
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("background-size: cover")
    })
    test("allows override of backgroundSize", () => {
        const Component = () => {
            return (
                <motion.div
                    style={{ image: "image.jpg", backgroundSize: "50%" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("background-size: 50%")
    })

    test("animates", async () => {
        const promise = new Promise<ChildNode | null>(resolve => {
            const resolvePromise = () => {
                setTimeout(() => resolve(container.firstChild), 20)
            }

            const Component = () => {
                return (
                    <motion.div
                        initial={{ size: "0%" }}
                        animate={{ size: "50%" }}
                        transition={{ duration: 0.1 }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle("width: 50%; height: 50%;")
    })

    test("doesn't animate numerical image", async () => {
        const promise = new Promise(resolve => {
            const resolvePromise = () => {
                resolve(container.firstChild)
            }

            const Component = () => {
                return (
                    <motion.div
                        initial={{ image: "url(1.jpg)" }}
                        animate={{ image: "url(2.jpg)" }}
                        transition={{ duration: 0.1 }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle(
            "background-image: url(2.jpg)"
        )
    })
})
