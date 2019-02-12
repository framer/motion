import * as React from "react"
import { motion } from "../../"
import { render } from "react-testing-library"
import { fireEvent } from "dom-testing-library"
import { motionValue } from "../../value"
import { mouseEnter, mouseLeave } from "../../../jest.setup"

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
                    hover={{ opacity: 0.75 }}
                    tap={{ opacity: 1 }}
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
            const Component = ({ isActive }) => {
                return (
                    <motion.div
                        initial={{ opacity: isActive ? 1 : 0.5 }}
                        animate={{ opacity: isActive ? 1 : 0.5 }}
                        hover={{ opacity: isActive ? 1 : 0.75 }}
                        tap={{ opacity: 1 }}
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
