import * as React from "react"
import { motion } from "../.."
import { fireEvent } from "@testing-library/dom"
import { motionValue } from "../../value"
import {
    mouseDown,
    mouseEnter,
    mouseLeave,
    mouseUp,
    render,
} from "../../../jest.setup"
import { drag, MockDrag } from "../drag/__tests__/utils"

describe("press", () => {
    test("press event listeners fire", () => {
        const press = jest.fn()
        const Component = () => <motion.div onTap={() => press()} />

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners are cleaned up", () => {
        const press = jest.fn()
        const { container, rerender } = render(
            <motion.div onTap={() => press()} />
        )
        rerender(<motion.div onTap={() => press()} />)
        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)
        expect(press).toBeCalledTimes(1)
        rerender(<motion.div />)
        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(container.firstChild as Element)
        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire if triggered by child", () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(getByTestId("child"))
        fireEvent.mouseUp(getByTestId("child"))

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire if triggered by child and released on bound element", () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(getByTestId("child"))
        fireEvent.mouseUp(container.firstChild as Element)

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners fire if triggered by bound element and released on child", () => {
        const press = jest.fn()
        const Component = () => (
            <motion.div onTap={() => press()}>
                <motion.div data-testid="child" />
            </motion.div>
        )

        const { container, getByTestId, rerender } = render(<Component />)
        rerender(<Component />)

        fireEvent.mouseDown(container.firstChild as Element)
        fireEvent.mouseUp(getByTestId("child"))

        expect(press).toBeCalledTimes(1)
    })

    test("press cancel fires if press released outside element", () => {
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

        fireEvent.mouseDown(getByTestId("child"))
        fireEvent.mouseUp(container.firstChild as Element)

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

        expect(press).toBeCalledTimes(1)
    })

    test("press event listeners unset", () => {
        const press = jest.fn()
        const Component = () => <motion.div onTap={() => press()} />

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
            mouseDown(container.firstChild as Element)

            logOpacity() // 1

            // Trigger mouse up
            mouseUp(container.firstChild as Element)
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
            mouseDown(getByTestId("child") as Element)

            logOpacity() // 1

            // Trigger mouse up
            mouseUp(getByTestId("child") as Element)
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
    //         fireEvent.mouseDown(getByTestId("child") as Element)
    //         logOpacity() // 1

    //         // Trigger mouse up
    //         fireEvent.mouseUp(getByTestId("child") as Element)
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
