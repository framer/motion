import * as React from "react"
import { motion } from "../.."
import { motionValue } from "../../value"
import {
    pointerDown,
    pointerEnter,
    pointerLeave,
    pointerUp,
    render,
} from "../../../jest.setup"
import { drag, MockDrag } from "../drag/__tests__/utils"
import { fireEvent } from "@testing-library/dom"
import { nextFrame } from "./utils"

const enterKey = {
    key: "Enter",
}

describe("press", () => {
    test("press event listeners fire", async () => {
        const press = jest.fn()
        const Component = () => <motion.div onTap={() => press()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)

        await nextFrame()

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire via keyboard", async () => {
        const press = jest.fn()
        const pressStart = jest.fn()
        const pressCancel = jest.fn()
        const Component = () => (
            <motion.div
                onTapStart={pressStart}
                onTap={press}
                onTapCancel={pressCancel}
            />
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.focus(container.firstChild as Element)
        fireEvent.keyDown(container.firstChild as Element, enterKey)

        await nextFrame()

        expect(pressStart).toBeCalledTimes(1)

        fireEvent.keyUp(container.firstChild as Element, enterKey)

        await nextFrame()

        expect(pressStart).toBeCalledTimes(1)
        expect(press).toBeCalledTimes(1)
        expect(pressCancel).toBeCalledTimes(0)
    })

    test("press cancel event listeners fire via keyboard", async () => {
        const press = jest.fn()
        const pressStart = jest.fn()
        const pressCancel = jest.fn()
        const Component = () => (
            <motion.div
                onTapStart={pressStart}
                onTap={press}
                onTapCancel={pressCancel}
            />
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.focus(container.firstChild as Element)
        fireEvent.keyDown(container.firstChild as Element, enterKey)

        await nextFrame()

        expect(pressStart).toBeCalledTimes(1)

        fireEvent.blur(container.firstChild as Element)

        await nextFrame()

        expect(pressStart).toBeCalledTimes(1)
        expect(press).toBeCalledTimes(0)
        expect(pressCancel).toBeCalledTimes(1)
    })

    test("press cancel event listeners not fired via keyboard after keyUp", async () => {
        const press = jest.fn()
        const pressStart = jest.fn()
        const pressCancel = jest.fn()
        const Component = () => (
            <motion.div
                onTapStart={pressStart}
                onTap={press}
                onTapCancel={pressCancel}
            />
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.focus(container.firstChild as Element)
        fireEvent.keyDown(container.firstChild as Element, enterKey)
        fireEvent.keyUp(container.firstChild as Element, enterKey)

        await nextFrame()

        expect(pressStart).toBeCalledTimes(1)

        fireEvent.blur(container.firstChild as Element)

        await nextFrame()

        expect(press).toBeCalledTimes(1)
        expect(pressStart).toBeCalledTimes(1)
        expect(pressCancel).toBeCalledTimes(0)
    })

    test("press event listeners are cleaned up", async () => {
        const press = jest.fn()
        const { container, rerender } = render(
            <motion.div onTap={() => press()} />
        )
        rerender(<motion.div onTap={() => press()} />)
        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)
        await nextFrame()
        expect(press).toBeCalledTimes(1)
        rerender(<motion.div />)
        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)
        await nextFrame()
        expect(press).toBeCalledTimes(1)
    })

    test("onTapCancel is correctly removed from a component", async () => {
        const cancelA = jest.fn()

        const Component = () => (
            <>
                <motion.div
                    data-testid="a"
                    onTap={() => {}}
                    onTapCancel={cancelA}
                />
                <motion.div data-testid="b" onTap={() => {}} />
            </>
        )

        const { getByTestId } = render(<Component />)

        const a = getByTestId("a")
        const b = getByTestId("b")

        pointerDown(a)
        pointerUp(a)
        await nextFrame()

        expect(cancelA).not.toHaveBeenCalled()

        pointerDown(b)
        pointerUp(b)
        await nextFrame()
        expect(cancelA).not.toHaveBeenCalled()
    })

    test("press event listeners fire if triggered by child", async () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        pointerDown(getByTestId("child"))
        pointerUp(getByTestId("child"))
        await nextFrame()

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire if triggered by child and released on bound element", async () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        pointerDown(getByTestId("child"))
        pointerUp(container.firstChild as Element)
        await nextFrame()

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire if triggered by bound element and released on child", async () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        pointerDown(container.firstChild as Element)
        pointerUp(getByTestId("child"))
        await nextFrame()

        expect(press).toBeCalledTimes(1)
    })

    test("press cancel fires if press released outside element", async () => {
        const pressCancel = jest.fn()
        const Component = () => (
            <motion.div>
                <motion.div
                    onTapCancel={() => pressCancel()}
                    data-testid="child"
                />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        pointerDown(getByTestId("child"))
        pointerUp(container.firstChild as Element)
        await nextFrame()

        expect(pressCancel).toBeCalledTimes(1)
    })

    test("press event listeners doesn't fire if parent is being dragged", async () => {
        const press = jest.fn()
        const Component = () => (
            <MockDrag>
                <motion.div drag>
                    <motion.div
                        data-testid="pressTarget"
                        onTap={() => press()}
                    />
                </motion.div>
            </MockDrag>
        )

        const { rerender, getByTestId } = render(<Component />)
        rerender(<Component />)

        const pointer = await drag(getByTestId("pressTarget")).to(1, 1)
        await pointer.to(10, 10)
        pointer.end()

        await nextFrame()
        expect(press).toBeCalledTimes(0)
    })

    test("press event listeners do fire if parent is being dragged only a little bit", async () => {
        const press = jest.fn()
        const Component = () => (
            <MockDrag>
                <motion.div drag>
                    <motion.div
                        data-testid="pressTarget"
                        onTap={() => press()}
                    />
                </motion.div>
            </MockDrag>
        )

        const { rerender, getByTestId } = render(<Component />)
        rerender(<Component />)

        const pointer = await drag(getByTestId("pressTarget")).to(0.5, 0.5)
        pointer.end()
        await nextFrame()

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners unset", async () => {
        const press = jest.fn()
        const Component = () => <motion.div onTap={() => press()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        rerender(<Component />)

        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)

        rerender(<Component />)
        rerender(<Component />)

        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)

        pointerDown(container.firstChild as Element)
        pointerUp(container.firstChild as Element)
        await nextFrame()

        expect(press).toBeCalledTimes(3)
    })

    test("press gesture variant applies and unapplies", () => {
        const promise = new Promise((resolve) => {
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

            const { container } = render(<Component />)

            logOpacity() // 0.5

            // Trigger mouse down
            pointerDown(container.firstChild as Element)

            logOpacity() // 1

            // Trigger mouse up
            pointerUp(container.firstChild as Element)
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("press gesture variant applies and unapplies via keyboard", () => {
        const promise = new Promise((resolve) => {
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

            const { container } = render(<Component />)

            logOpacity() // 0.5

            fireEvent.focus(container.firstChild as Element)
            fireEvent.keyDown(container.firstChild as Element, enterKey)

            logOpacity() // 1

            fireEvent.keyUp(container.firstChild as Element, enterKey)
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("press gesture variant applies and unapplies via blur cancel", () => {
        const promise = new Promise((resolve) => {
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

            const { container } = render(<Component />)

            logOpacity() // 0.5

            fireEvent.focus(container.firstChild as Element)
            fireEvent.keyDown(container.firstChild as Element, enterKey)

            logOpacity() // 1

            fireEvent.blur(container.firstChild as Element)
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("press gesture variant unapplies children", () => {
        const promise = new Promise((resolve) => {
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

            const { getByTestId } = render(<Component />)

            logOpacity() // 0.5

            // Trigger mouse down
            pointerDown(getByTestId("child") as Element)

            logOpacity() // 1

            // Trigger mouse up
            pointerUp(getByTestId("child") as Element)
            logOpacity() // 0.5
            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("press gesture works with animation state", async () => {
        const [a, b] = await new Promise((resolve) => {
            const childProps = {
                variants: {
                    rest: { opacity: 0.5 },
                    pressed: { opacity: 0.8 },
                },
                transition: { duration: 0.01 },
            }

            const Component = () => {
                const [isPressed, setPressedState] = React.useState(false)
                return (
                    <motion.div
                        data-testid="parent"
                        animate={isPressed ? ["pressed"] : ["rest"]}
                    >
                        <motion.div
                            data-testid="a"
                            {...childProps}
                            onTapStart={() => setPressedState(true)}
                        />
                        <motion.div data-testid="b" {...childProps} />
                    </motion.div>
                )
            }

            const { getByTestId } = render(<Component />)

            // Trigger mouse down
            pointerDown(getByTestId("a") as Element)
            setTimeout(
                () =>
                    resolve([
                        getByTestId("a") as Element,
                        getByTestId("b") as Element,
                    ]),
                100
            )
        })

        expect(a).toHaveStyle("opacity: 0.8")
        expect(b).toHaveStyle("opacity: 0.8")
    })

    /**
     * TODO: We want the behaviour that we can override individual componnets with their
     * own whileX props to apply gesture behaviour just on that component.
     *
     * We want to add it in a way that maintains propagation of `animate`.
     */
    // test.skip("press gesture variants - children can override with own variant", () => {
    //     const promise = new Promise(resolve => {
    //         const opacityHistory: number[] = []
    //         const opacity = motionValue(0.5)
    //         const logOpacity = () => opacityHistory.push(opacity.get())

    //         const Component = () => (
    //             <motion.div whileTap="pressed">
    //                 <motion.div
    //                     data-testid="child"
    //                     variants={{
    //                         pressed: { opacity: 1 },
    //                         childPressed: { opacity: 0.1 },
    //                     }}
    //                     style={{ opacity }}
    //                     transition={{ type: false }}
    //                     whileTap="childPressed"
    //                 />
    //             </motion.div>
    //         )

    //         const { getByTestId, rerender } = render(<Component />)
    //         rerender(<Component />)

    //         logOpacity() // 0.5

    //         // Trigger mouse down
    //         pointerDown(getByTestId("child") as Element)
    //         logOpacity() // 1

    //         // Trigger mouse up
    //         pointerUp(getByTestId("child") as Element)
    //         logOpacity() // 0.5

    //         resolve(opacityHistory)
    //     })

    //     return expect(promise).resolves.toEqual([0.5, 0.1, 0.5])
    // })

    test("press gesture variant applies and unapplies with whileHover", () => {
        const promise = new Promise((resolve) => {
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
            pointerEnter(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger mouse down
            pointerDown(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse up
            pointerUp(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger hover end
            pointerLeave(container.firstChild as Element)
            logOpacity()

            // Trigger hover
            pointerEnter(container.firstChild as Element)
            logOpacity()

            // Trigger mouse down
            pointerDown(container.firstChild as Element)
            logOpacity()

            // Trigger hover end
            pointerLeave(container.firstChild as Element)
            logOpacity()

            // Trigger mouse up
            pointerUp(container.firstChild as Element)
            logOpacity()

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([
            0.5, 0.75, 1, 0.75, 0.5, 0.75, 1, 1, 0.5,
        ])
    })

    test("press gesture variant applies and unapplies as state changes", () => {
        const promise = new Promise((resolve) => {
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
            pointerEnter(container.firstChild as Element)
            logOpacity() // 0.75

            // Trigger mouse down
            pointerDown(container.firstChild as Element)
            logOpacity() // 1
            rerender(<Component isActive={true} />)
            rerender(<Component isActive={true} />)

            // Trigger mouse up
            pointerUp(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover end
            pointerLeave(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover
            pointerEnter(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse down
            pointerDown(container.firstChild as Element)
            logOpacity() // 1

            // Trigger hover end
            pointerLeave(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse up
            pointerUp(container.firstChild as Element)
            logOpacity() // 1

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([
            0.5, 0.75, 1, 1, 1, 1, 1, 1, 1,
        ])
    })
})
