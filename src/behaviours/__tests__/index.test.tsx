import * as React from "react"
import { motion } from "../../"
import { motionValue } from "../../value"
import { MotionPlugins } from "../../motion/utils/MotionPluginContext"
import { render } from "react-testing-library"
import { fireEvent } from "dom-testing-library"
import sync from "framesync"

const pos = {
    x: 0,
    y: 0,
}

const drag = (element: any) => {
    pos.x = 0
    pos.y = 0
    fireEvent.mouseDown(element)

    const controls = {
        to: (x: number, y: number) => {
            pos.x = x
            pos.y = y
            fireEvent.mouseMove(document.body)

            return controls
        },
        end: () => {
            fireEvent.mouseUp(document.body)
        },
    }

    return controls
}

const MockDrag = ({ children }: { children: React.ReactNode }) => (
    <MotionPlugins transformPagePoint={() => pos}>{children}</MotionPlugins>
)

describe("dragging", () => {
    test("dragStart fires", async () => {
        const promise = new Promise(resolve => {
            const onDragStart = jest.fn()
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled onDragStart={onDragStart} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(100, 100)

            sync.postRender(() => {
                pointer.end()
                resolve(onDragStart)
            })
        })

        return expect(promise).resolves.toBeCalledTimes(1)
    })

    test("dragEnd fires", async () => {
        const promise = new Promise(resolve => {
            const onDragEnd = jest.fn()
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled onDragEnd={onDragEnd} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            drag(container.firstChild)
                .to(100, 100)
                .end()

            sync.postRender(() => {
                resolve(onDragEnd)
            })
        })

        return expect(promise).resolves.toBeCalledTimes(1)
    })

    test("limit to x", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled="x" style={{ x, y }} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(50, 50)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([50, 0])
    })

    test("limit to y", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled="y" style={{ x, y }} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(50, 50)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([0, 50])
    })

    test("limit to initial direction: x", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled="lockDirection" style={{ x, y }} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(100, 0)

            sync.postRender(() => {
                pointer.to(50, 4)
                sync.postRender(() => {
                    pointer.to(200, 10)

                    sync.postRender(() => {
                        pointer.end()
                        resolve([x.get(), y.get()])
                    })
                })
            })
        })

        return expect(promise).resolves.toEqual([200, 0])
    })

    test("limit to initial direction: y", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div dragEnabled="lockDirection" style={{ x, y }} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(0, 100)

            sync.postRender(() => {
                pointer.to(4, 50)
                sync.postRender(() => {
                    pointer.to(10, 200)

                    sync.postRender(() => {
                        pointer.end()
                        resolve([x.get(), y.get()])
                    })
                })
            })
        })

        return expect(promise).resolves.toEqual([0, 200])
    })

    test("impose left drag constraint", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        dragEnabled
                        dragConstraints={{ left: -100 }}
                        dragElastic={false}
                        style={{ x, y }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(-200, 50)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([-100, 50])
    })

    test("impose right drag constraint", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        dragEnabled
                        dragConstraints={{ right: 300 }}
                        dragElastic={false}
                        style={{ x, y }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(500, 50)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([300, 50])
    })

    test("impose top drag constraint", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        dragEnabled
                        dragConstraints={{ top: -100 }}
                        dragElastic={false}
                        style={{ x, y }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(500, -500)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([500, -100])
    })

    test("impose bottom drag constraint", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        dragEnabled
                        dragConstraints={{ bottom: 100 }}
                        dragElastic={false}
                        style={{ x, y }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(500, 500)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([500, 100])
    })
})
