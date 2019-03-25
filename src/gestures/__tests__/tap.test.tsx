import * as React from "react"
import { motion } from "../../"
import { render } from "react-testing-library"
import { fireEvent } from "dom-testing-library"
import { motionValue } from "../../value"
import { mouseEnter, mouseLeave } from "../../../jest.setup"
import { drag, MockDrag } from "../../behaviours/__tests__/index.test"
import sync from "framesync"

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
                    press={{ opacity: 1 }}
                    style={{ opacity }}
                />
            )

            const { container, rerender } = render(<Component />)
            rerender(<Component />)

            logOpacity() // 0.5

            // Trigger mouse down
            fireEvent.mouseDown(container.firstChild as Element)
            logOpacity() // 1

            // Trigger mouse up
            fireEvent.mouseUp(container.firstChild as Element)
            logOpacity() // 0.5

            resolve(opacityHistory)
        })

        return expect(promise).resolves.toEqual([0.5, 1, 0.5])
    })

    test("tap gesture variant applies and unapplies with hover", () => {
        const promise = new Promise(resolve => {
            const opacityHistory: number[] = []
            const opacity = motionValue(0.5)
            const logOpacity = () => opacityHistory.push(opacity.get())
            const Component = () => (
                <motion.div
                    initial={{ opacity: 0.5 }}
                    transition={{ type: false }}
                    hover={{ opacity: 0.75 }}
                    press={{ opacity: 1 }}
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
                        hover={{ opacity: isActive ? 1 : 0.75 }}
                        press={{ opacity: 1 }}
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
