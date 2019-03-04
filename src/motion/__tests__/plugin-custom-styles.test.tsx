import "../../../jest.setup"
import { render } from "react-testing-library"
import { motion } from ".."
import { MotionPlugins } from "../context/MotionPluginContext"
import * as React from "react"

const customPlugin = {
    size: {
        transform: v => ({ width: v, height: v }),
    },
    image: {
        transform: v => ({ backgroundImage: v }),
        motionEnabled: false,
    },
}

describe("custom values plugin", () => {
    test("renders", () => {
        const Component = () => {
            return (
                <MotionPlugins customStyles={customPlugin}>
                    <motion.div style={{ size: "100%" }} />
                </MotionPlugins>
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("width: 100%; height: 100%;")
    })

    test("animates", async () => {
        const promise = new Promise(resolve => {
            const resolvePromise = () => {
                setTimeout(() => resolve(container.firstChild), 17)
            }

            const Component = () => {
                return (
                    <MotionPlugins customStyles={customPlugin}>
                        <motion.div
                            initial={{ size: "0%" }}
                            animate={{ size: "50%" }}
                            transition={{ duration: 0.1 }}
                            onAnimationComplete={resolvePromise}
                        />
                    </MotionPlugins>
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle("width: 50%; height: 50%;")
    })

    test("doesn't animate when motionEnabled is false, even if prop is animatable", async () => {
        const promise = new Promise(resolve => {
            const resolvePromise = () => {
                resolve(container.firstChild)
            }

            const Component = () => {
                return (
                    <MotionPlugins customStyles={customPlugin}>
                        <motion.div
                            initial={{ image: "url(1.jpg)" }}
                            animate={{ image: "url(2.jpg)" }}
                            transition={{ duration: 0.1 }}
                            onAnimationComplete={resolvePromise}
                        />
                    </MotionPlugins>
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
