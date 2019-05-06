import * as React from "react"
import { useState } from "react"
import { motion } from "../../"
import { motionValue } from "../../value"
import { MotionPlugins } from "../../motion/context/MotionPluginContext"
import { render } from "react-testing-library"
import { fireEvent } from "dom-testing-library"
import sync from "framesync"
import { Constraints } from "../use-draggable"

type Point = {
    x: number
    y: number
}

const pos: Point = {
    x: 0,
    y: 0,
}

export const drag = (element: any) => {
    pos.x = 0
    pos.y = 0
    fireEvent.mouseDown(element)

    const controls = {
        to: (x: number, y: number) => {
            pos.x = x
            pos.y = y
            fireEvent.mouseMove(document.body, { buttons: 1 })

            return controls
        },
        end: () => {
            fireEvent.mouseUp(document.body)
        },
    }

    return controls
}

export const MockDrag = ({ children }: { children: React.ReactNode }) => (
    <MotionPlugins transformPagePoint={() => pos}>{children}</MotionPlugins>
)

describe("dragging", () => {
    test("dragStart fires", async () => {
        const promise = new Promise(resolve => {
            const onDragStart = jest.fn()
            const Component = () => (
                <MockDrag>
                    <motion.div drag onDragStart={onDragStart} />
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
                    <motion.div drag onDragEnd={onDragEnd} />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(100, 100)

            sync.postRender(() => {
                pointer.end()
                resolve(onDragEnd)
            })
        })

        return expect(promise).resolves.toBeCalledTimes(1)
    })

    test("drag handlers aren't frozen at drag session start", async () => {
        const promise = new Promise(resolve => {
            let count = 0
            const Component = () => {
                const [increment, setIncrement] = useState(1)
                return (
                    <MockDrag>
                        <motion.div
                            drag
                            onDragStart={() => {
                                count += increment
                                setIncrement(2)
                            }}
                            onDrag={() => (count += increment)}
                            onDragEnd={() => {
                                count += increment
                                resolve(count)
                            }}
                        />
                    </MockDrag>
                )
            }

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(100, 100)

            sync.postRender(() => {
                pointer.to(50, 50)
                sync.postRender(() => {
                    pointer.end()
                })
            })
        })

        return expect(promise).resolves.toBe(7)
    })

    test("dragEnd returns transformed pointer", async () => {
        const promise = new Promise(resolve => {
            let p: Point = { x: 0, y: 0 }

            const onDrag = (_e: MouseEvent, { point }: { point: Point }) => {
                p.x = point.x
                p.y = point.y
            }
            const onDragEnd = (_e: MouseEvent, { point }: { point: Point }) => {
                resolve(point.x === p.x && point.y === p.y)
            }
            const Component = () => (
                <MockDrag>
                    <motion.div
                        data-testid="draggable"
                        drag
                        onDrag={onDrag}
                        onDragEnd={onDragEnd}
                        style={{ x: 100, y: 100 }}
                    />
                </MockDrag>
            )

            const { getByTestId, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("draggable")).to(50, 50)

            sync.postRender(() => {
                pointer.end()
            })
        })

        return expect(promise).resolves.toBe(true)
    })

    test("panSessionStart fires", async () => {
        const promise = new Promise(resolve => {
            const onDragStart = jest.fn()
            const Component = () => (
                <MockDrag>
                    <motion.div drag onPanSessionStart={onDragStart} />
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

    test("dragTransitionEnd fires", async () => {
        const promise = new Promise(resolve => {
            const Component = () => (
                <MockDrag>
                    <motion.div
                        drag
                        onDragTransitionEnd={() => resolve(true)}
                        dragConstraints={{
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                        dragTransition={{
                            bounceStiffness: 100000,
                            bounceDamping: 100000,
                        }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(50, 50)
                sync.postRender(() => {
                    pointer.end()
                })
            })
        })

        return expect(promise).resolves.toBe(true)
    })

    test("limit to x", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div drag="x" style={{ x, y }} />
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
                    <motion.div drag="y" style={{ x, y }} />
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
                    <motion.div drag dragDirectionLock style={{ x, y }} />
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
                    <motion.div drag="y" dragDirectionLock style={{ x, y }} />
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

    test("block drag propagation", async () => {
        const promise = new Promise(resolve => {
            const childX = motionValue(0)
            const parentX = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div drag="x" style={{ x: parentX }}>
                        <motion.div
                            data-testid="child"
                            drag
                            style={{ x: childX }}
                        />
                    </motion.div>
                </MockDrag>
            )

            const { getByTestId, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("child")).to(10, 0)

            sync.postRender(() => {
                pointer.to(20, 0)

                sync.postRender(() => {
                    pointer.end()
                    resolve([parentX.get(), childX.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([0, 20])
    })

    test("enable drag propagation", async () => {
        const promise = new Promise(resolve => {
            const childX = motionValue(0)
            const parentX = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div drag="x" style={{ x: parentX }}>
                        <motion.div
                            data-testid="child"
                            drag="x"
                            dragPropagation
                            style={{ x: childX }}
                        />
                    </motion.div>
                </MockDrag>
            )

            const { getByTestId, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("child")).to(10, 0)

            sync.postRender(() => {
                pointer.to(20, 0)

                sync.postRender(() => {
                    pointer.end()
                    resolve([parentX.get(), childX.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([20, 20])
    })

    test("allow drag propagation on opposing axis", async () => {
        const promise = new Promise(resolve => {
            const childX = motionValue(0)
            const childY = motionValue(0)
            const parentX = motionValue(0)
            const parentY = motionValue(0)

            const Component = () => (
                <MockDrag>
                    <motion.div drag="x" style={{ x: parentX, y: parentY }}>
                        <motion.div
                            data-testid="child"
                            drag="y"
                            style={{ x: childX, y: childY }}
                        />
                    </motion.div>
                </MockDrag>
            )

            const { getByTestId, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("child")).to(10, 10)

            sync.postRender(() => {
                pointer.to(20, 20)

                sync.postRender(() => {
                    pointer.end()
                    resolve([
                        parentX.get(),
                        parentY.get(),
                        childX.get(),
                        childY.get(),
                    ])
                })
            })
        })

        return expect(promise).resolves.toEqual([20, 0, 0, 20])
    })

    test("impose left drag constraint", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        drag
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
                        drag
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
                        drag
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
                        drag
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

    test("drag constraints can be updated", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = ({
                constraints,
            }: {
                constraints: Constraints
            }) => (
                <MockDrag>
                    <motion.div
                        drag
                        dragConstraints={constraints}
                        dragElastic={false}
                        style={{ x, y }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(
                <Component constraints={{ top: -100, bottom: 0 }} />
            )
            rerender(<Component constraints={{ top: -100, bottom: 0 }} />)
            rerender(<Component constraints={{ top: -50, bottom: 0 }} />)
            rerender(<Component constraints={{ top: -50, bottom: 0 }} />)

            const pointer = drag(container.firstChild).to(1, 1)

            sync.postRender(() => {
                pointer.to(500, -500)
                sync.postRender(() => {
                    pointer.end()
                    resolve([x.get(), y.get()])
                })
            })
        })

        return expect(promise).resolves.toEqual([500, -50])
    })

    test("updates position when updating drag constraints", async () => {
        const x = motionValue(100)
        const y = motionValue(100)
        const Component = ({ constraints }: { constraints: Constraints }) => (
            <MockDrag>
                <motion.div
                    drag
                    dragConstraints={constraints}
                    dragElastic={false}
                    style={{ x, y }}
                />
            </MockDrag>
        )

        const { rerender } = render(
            <Component constraints={{ right: 42, bottom: 53 }} />
        )

        // Should have updated the x and y
        expect(x.get()).toEqual(42)
        expect(y.get()).toEqual(53)

        // Should not updated when broadening the constraints
        rerender(
            <Component
                constraints={{ left: 10, top: 14, right: 100, bottom: 100 }}
            />
        )
        expect(x.get()).toEqual(42)
        expect(y.get()).toEqual(53)

        // Should update when updating the contstraints again
        render(<Component constraints={{ left: 60, top: 70 }} />)

        // Should have updated the x and y
        expect(x.get()).toEqual(60)
        expect(y.get()).toEqual(70)
    })

    test("applies drag transition", async () => {
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div
                        style={{ x, y }}
                        drag="x"
                        dragConstraints={{ left: -500, right: 500 }}
                        dragElastic
                        dragMomentum
                        dragTransition={{
                            bounceStiffness: 300000,
                            bounceDamping: 1000000,
                        }}
                    />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)
            sync.postRender(() => {
                pointer.to(-500, 0)
                sync.postRender(() => {
                    pointer.end()
                    setTimeout(() => {
                        // if we set really strong spring and animation has ended - this has worked
                        resolve(x.get())
                    }, 50)
                })
            })
        })

        return expect(promise).resolves.toBeCloseTo(-500)
    })

    test("pointer down kills momentum", async () => {
        let lastX = 0
        const promise = new Promise(resolve => {
            const x = motionValue(0)
            const y = motionValue(0)
            const Component = () => (
                <MockDrag>
                    <motion.div style={{ x, y }} drag />
                </MockDrag>
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(container.firstChild).to(1, 1)
            sync.postRender(() => {
                pointer.to(100, 100)
                sync.postRender(() => {
                    pointer.end()

                    sync.postRender(() => {
                        lastX = x.get()
                        fireEvent.mouseDown(container.firstChild as Element)

                        sync.postRender(() => {
                            resolve(x.get() === lastX)
                        })
                    })
                })
            })
        })

        return expect(promise).resolves.toBe(true)
    })
})
