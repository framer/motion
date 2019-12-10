import * as React from "react"
import { motion } from "../../"
import { fireEvent } from "@testing-library/dom"
import { motionValue } from "../../value"
import { mouseEnter, mouseLeave, render } from "../../../jest.setup"
import { drag, MockDrag } from "../../behaviours/__tests__/utils"
import sync from "framesync"
import { act } from "react-dom/test-utils"

function mockWhenFirstArgumentIs(
    original: (...args: any[]) => any,
    firstArg: any
) {
    const mocked = jest.fn(original)
    return [
        (...args: any[]) => {
            if (args[0] === firstArg) {
                return mocked(...args)
            } else {
                return original(...args)
            }
        },
        mocked,
    ]
}

describe("tap", () => {
    test("tap event listeners fire", () => {
        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        expect(tap).toBeCalledTimes(1)
    })

    test("tap event listeners are cleaned up when mouse up", () => {
        const [
            addEventListener,
            mockedAddMouseUpListener,
        ] = mockWhenFirstArgumentIs(window.addEventListener, "mouseup")
        window.addEventListener = addEventListener
        const [
            removeEventListener,
            mockedRemoveMouseUpListener,
        ] = mockWhenFirstArgumentIs(window.removeEventListener, "mouseup")
        window.removeEventListener = removeEventListener

        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(0)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(0)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(1)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(0)
        fireEvent.mouseUp(container.firstChild as Element)
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(1)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(1)

        expect(tap).toBeCalledTimes(1)
    })

    test("tap event listeners are cleaned up when unmounted", () => {
        const [
            addEventListener,
            mockedAddMouseUpListener,
        ] = mockWhenFirstArgumentIs(window.addEventListener, "mouseup")
        window.addEventListener = addEventListener
        const [
            removeEventListener,
            mockedRemoveMouseUpListener,
        ] = mockWhenFirstArgumentIs(window.removeEventListener, "mouseup")
        window.removeEventListener = removeEventListener

        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender, unmount } = render(<Component />)
        rerender(<Component />)
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(0)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(0)
        fireEvent.mouseDown(container.firstChild as Element)
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(1)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(0)
        unmount()
        expect(mockedAddMouseUpListener).toHaveBeenCalledTimes(1)
        expect(mockedRemoveMouseUpListener).toHaveBeenCalledTimes(1)

        expect(tap).toBeCalledTimes(0)
    })
    // test("tap event listeners fire if triggered by child", () => {
    //     const tap = jest.fn()
    //     const Component = () => (
    //         <motion.div onTap={() => tap()}>
    //             <motion.div data-testid="child" />
    //         </motion.div>
    //     )

    //     const { getByTestId, rerender } = render(<Component />)
    //     rerender(<Component />)

    //     fireEvent.mouseDown(getByTestId("child"))
    //     fireEvent.mouseUp(getByTestId("child"))

    //     expect(tap).toBeCalledTimes(1)
    // })

    // test("tap event listeners fire if triggered by child and released on bound element", () => {
    //     const tap = jest.fn()
    //     const Component = () => (
    //         <motion.div onTap={() => tap()}>
    //             <motion.div data-testid="child" />
    //         </motion.div>
    //     )

    //     const { container, getByTestId, rerender } = render(<Component />)
    //     rerender(<Component />)

    //     fireEvent.mouseDown(getByTestId("child"))
    //     fireEvent.mouseUp(container.firstChild as Element)

    //     expect(tap).toBeCalledTimes(1)
    // })

    // test("tap event listeners fire if triggered by bound element and released on child", () => {
    //     const tap = jest.fn()
    //     const Component = () => (
    //         <motion.div onTap={() => tap()}>
    //             <motion.div data-testid="child" />
    //         </motion.div>
    //     )

    //     const { container, getByTestId, rerender } = render(<Component />)
    //     rerender(<Component />)

    //     fireEvent.mouseDown(container.firstChild as Element)
    //     fireEvent.mouseUp(getByTestId("child"))

    //     expect(tap).toBeCalledTimes(1)
    // })

    // test("tap cancel fires if tap released outside element", () => {
    //     const tapCancel = jest.fn()
    //     const Component = () => (
    //         <motion.div>
    //             <motion.div
    //                 onTapCancel={() => tapCancel()}
    //                 data-testid="child"
    //             />
    //         </motion.div>
    //     )

    //     const { container, getByTestId, rerender } = render(<Component />)
    //     rerender(<Component />)

    //     fireEvent.mouseDown(getByTestId("child"))
    //     fireEvent.mouseUp(container.firstChild as Element)

    //     expect(tapCancel).toBeCalledTimes(1)
    // })

    test("tap event listeners doesn't fire if parent is being dragged", async () => {
        const tap = jest.fn()
        const promise = new Promise(resolve => {
            const Component = () => (
                <MockDrag>
                    <motion.div drag>
                        <motion.div
                            data-testid="tapTarget"
                            onTap={() => tap()}
                        />
                    </motion.div>
                </MockDrag>
            )

            const { rerender, getByTestId } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("tapTarget")).to(1, 1)
            sync.postRender(() => {
                pointer.to(10, 10)
                sync.postRender(() => {
                    pointer.end()
                    resolve(tap)
                })
            })
        })

        return expect(promise).resolves.toBeCalledTimes(0)
    })

    test("tap event listeners do fire if parent is being dragged only a little bit", async () => {
        const tap = jest.fn()
        const promise = new Promise(resolve => {
            const Component = () => (
                <MockDrag>
                    <motion.div drag>
                        <motion.div
                            data-testid="tapTarget"
                            onTap={() => tap()}
                        />
                    </motion.div>
                </MockDrag>
            )

            const { rerender, getByTestId } = render(<Component />)
            rerender(<Component />)

            const pointer = drag(getByTestId("tapTarget"))
            sync.postRender(() => {
                pointer.to(0.5, 0.5)
                sync.postRender(() => {
                    pointer.end()
                    resolve(tap)
                })
            })
        })

        return expect(promise).resolves.toBeCalledTimes(1)
    })

    test("tap event listeners unset", () => {
        const tap = jest.fn()
        const Component = () => <motion.div onTap={() => tap()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        rerender(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        expect(tap).toBeCalledTimes(3)
    })

    test("tap gesture variant applies and unapplies", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())
            const Component = () => (
                <motion.div
                    initial={{ opacity: 0.5 }}
                    transition={{ type: false }}
                    whileTap={{ opacity: 1 }}
                    style={{ opacity }}
                />
            )

            let container: any
            act(() => {
                const { container: componentContainer } = render(<Component />)
                container = componentContainer
            })

            logOpacity() // 0.5

            act(() => {
                // Trigger mouse down
                fireEvent.mouseDown(container.firstChild as Element)
            })
            logOpacity() // 1

            act(() => {
                // Trigger mouse up
                fireEvent.mouseUp(container.firstChild as Element)
            })
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("tap gesture variant unapplies children", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())
            const Component = () => (
                <motion.div whileTap="pressed">
                    <motion.div
                        data-testid="child"
                        variants={{ pressed: { opacity: 1 } }}
                        style={{ opacity }}
                        transition={{ type: false }}
                    />
                </motion.div>
            )

            let getByTestId: any

            act(() => {
                const { getByTestId: byId } = render(<Component />)
                getByTestId = byId
            })

            logOpacity() // 0.5

            act(() => {
                // Trigger mouse down
                fireEvent.mouseDown(getByTestId("child") as Element)
            })

            logOpacity() // 1

            act(() => {
                // Trigger mouse up
                fireEvent.mouseUp(getByTestId("child") as Element)
            })
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    /**
     * TODO: We want the behaviour that we can override individual componnets with their
     * own whileX props to apply gesture behaviour just on that component.
     *
     * We want to add it in a way that maintains propagation of `animate`.
     */
    test.skip("tap gesture variants - children can override with own variant", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())

            const Component = () => (
                <motion.div whileTap="pressed">
                    <motion.div
                        data-testid="child"
                        variants={{
                            pressed: { opacity: 1 },
                            childPressed: { opacity: 0.1 },
                        }}
                        style={{ opacity }}
                        transition={{ type: false }}
                        whileTap="childPressed"
                    />
                </motion.div>
            )

            const { getByTestId, rerender } = render(<Component />)
            rerender(<Component />)

            logOpacity() // 0.5

            // Trigger mouse down
            fireEvent.mouseDown(getByTestId("child") as Element)
            logOpacity() // 1

            // Trigger mouse up
            fireEvent.mouseUp(getByTestId("child") as Element)
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 0.1, 0.5])
    })

    test("tap gesture variant applies and unapplies with whileHover", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())
            const Component = () => (
                <motion.div
                    initial={{ opacity: 0.5 }}
                    transition={{ type: false }}
                    whileHover={{ opacity: 0.75 }}
                    whileTap={{ opacity: 1 }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            logOpacity() // 0.5

            // Trigger hover
            mouseEnter(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger mouse down
            fireEvent.mouseDown(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse up
            fireEvent.mouseUp(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger hover end
            mouseLeave(container.firstChild as Element)
            logOpacity()

            // Trigger hover
            mouseEnter(container.firstChild as Element)
            logOpacity()

            // Trigger mouse down
            fireEvent.mouseDown(container.firstChild as Element)
            logOpacity()

            // Trigger hover end
            mouseLeave(container.firstChild as Element)
            logOpacity()

            // Trigger mouse up
            fireEvent.mouseUp(container.firstChild as Element)
            logOpacity()

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([
            0.5,
            0.75,
            1,
            0.75,
            0.5,
            0.75,
            1,
            1,
            0.5,
        ])
    })

    test("tap gesture variant applies and unapplies as state changes", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())
            const Component = ({ isActive }: { isActive: boolean }) => {
                return (
                    <motion.div
                        initial={{ opacity: isActive ? 1 : 0.5 }}
                        animate={{ opacity: isActive ? 1 : 0.5 }}
                        whileHover={{ opacity: isActive ? 1 : 0.75 }}
                        whileTap={{ opacity: 1 }}
                        transition={{ type: false }}
                        style={{ opacity }}
                    />
                )
            }

            const { container, rerender } = render(
                <Component isActive={false} />
            )
            rerender(<Component isActive={false} />)

            logOpacity() // 0.5

            // Trigger hover
            mouseEnter(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger mouse down
            fireEvent.mouseDown(container.firstChild as Element)
            logOpacity() // 1
            rerender(<Component isActive={true} />)
            rerender(<Component isActive={true} />)

            // Trigger mouse up
            fireEvent.mouseUp(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover end
            mouseLeave(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover
            mouseEnter(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse down
            fireEvent.mouseDown(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover end
            mouseLeave(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse up
            fireEvent.mouseUp(container.firstChild as Element)
            logOpacity() // 1

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([
            0.5,
            0.75,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
        ])
    })
})
