import { render } from "../../../jest.setup"
import { motion } from "../.."
import * as React from "react"
import { transformValues } from "./util-transform-values"

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

    toValue() {
        return this.get()
    }
}

describe("custom properties", () => {
    test("renders", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    style={{ size: "100%" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("width: 100%; height: 100%;")
    })

    test("adds a url if it does not exist yet", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    style={{ image: "image.jpg" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle(
            "background-image: url(image.jpg); "
        )
    })
    test("adds background-size: cover", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    style={{ image: "image.jpg" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("background-size: cover")
    })
    test("allows override of backgroundSize", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    style={{ image: "image.jpg", backgroundSize: "50%" }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("background-size: 50%")
    })

    test("animates", async () => {
        const promise = new Promise<ChildNode | null>((resolve) => {
            const resolvePromise = () => {
                setTimeout(() => resolve(container.firstChild), 20)
            }

            const Component = () => {
                return (
                    <motion.div
                        transformValues={transformValues}
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

    test("animates and sets custom values transitionEnd", async () => {
        const promise = new Promise<ChildNode | null>((resolve) => {
            const resolvePromise = () => {
                requestAnimationFrame(() => resolve(container.firstChild))
            }

            const Component = () => {
                return (
                    <motion.div
                        transformValues={transformValues}
                        initial={{ size: "0%" }}
                        animate={{ size: "50%", transitionEnd: { size: 100 } }}
                        transition={{
                            duration: 0.1,
                        }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle(
            "width: 100px; height: 100px;"
        )
    })

    test("doesn't animate numerical image", async (): Promise<any> => {
        const promise = new Promise((resolve) => {
            const resolvePromise = () => {
                resolve(container.firstChild!)
            }

            const Component = () => {
                return (
                    <motion.div
                        transformValues={transformValues}
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

describe("custom values type", () => {
    test("renders via style", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    style={{ height: new Custom(200) }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("height: 200px")
    })

    test("renders via initial", () => {
        const Component = () => {
            return (
                <motion.div
                    transformValues={transformValues}
                    initial={{ height: new Custom(200) }}
                />
            )
        }

        const { container } = render(<Component />)

        expect(container.firstChild).toHaveStyle("height: 200px")
    })

    test("animates custom value type", async () => {
        const promise = new Promise((resolve) => {
            const resolvePromise = () => {
                requestAnimationFrame(() => resolve(container.firstChild!))
            }

            const Component = () => {
                return (
                    <motion.div
                        transformValues={transformValues}
                        initial={{ height: new Custom(0) }}
                        animate={{ height: new Custom(100) }}
                        transition={{ duration: 0.1 }}
                        onAnimationComplete={resolvePromise}
                    />
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)
        })

        return expect(promise).resolves.toHaveStyle("height: 100px")
    })
})
