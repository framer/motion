import { waitFor } from "@testing-library/dom"
import { act, useEffect } from "react"
import { AnimatePresence, motion } from "../../.."
import { render } from "../../../jest.setup"

/**
 * #2538: onExitComplete should fire after the exiting children have
 * unmounted, so their effect cleanups have already run.
 */
describe("AnimatePresence onExitComplete timing", () => {
    test("fires after exiting children unmount and run effect cleanups", async () => {
        const log: string[] = []

        const Child = () => {
            useEffect(() => () => void log.push("cleanup"), [])
            return (
                <motion.div
                    id="child"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                />
            )
        }

        const Component = ({ isVisible }: { isVisible: boolean }) => (
            <AnimatePresence
                onExitComplete={() =>
                    log.push(
                        document.getElementById("child")
                            ? "exitComplete:mounted"
                            : "exitComplete:unmounted"
                    )
                }
            >
                {isVisible && <Child key="child" />}
            </AnimatePresence>
        )

        const { rerender } = render(<Component isVisible />)
        log.length = 0

        await act(async () => rerender(<Component isVisible={false} />))
        await waitFor(() => expect(log.length).toBe(2))

        expect(log).toEqual(["cleanup", "exitComplete:unmounted"])
    })

    test("fires once per exit cycle", async () => {
        const onExitComplete = jest.fn()

        const Component = ({ isVisible }: { isVisible: boolean }) => (
            <AnimatePresence onExitComplete={onExitComplete}>
                {isVisible && (
                    <motion.div
                        key="child"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.05 }}
                    />
                )}
            </AnimatePresence>
        )

        const { rerender } = render(<Component isVisible />)

        await act(async () => rerender(<Component isVisible={false} />))
        await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(1))

        await act(async () => rerender(<Component isVisible />))
        await act(async () => rerender(<Component isVisible={false} />))
        await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(2))

        await new Promise((resolve) => setTimeout(resolve, 100))
        expect(onExitComplete).toHaveBeenCalledTimes(2)
    })

    test("still fires when a propagating parent removes it in the same update", async () => {
        const onInnerExitComplete = jest.fn()
        const onOuterExitComplete = jest.fn()

        const Component = ({ isVisible }: { isVisible: boolean }) => (
            <AnimatePresence onExitComplete={onOuterExitComplete}>
                {isVisible && (
                    <motion.div key="outer" exit={{ opacity: 0 }}>
                        <AnimatePresence
                            propagate
                            onExitComplete={onInnerExitComplete}
                        >
                            <motion.div
                                key="inner"
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.05 }}
                            />
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        )

        const { rerender, container } = render(<Component isVisible />)

        await act(async () => rerender(<Component isVisible={false} />))
        await waitFor(() => expect(onOuterExitComplete).toHaveBeenCalled())

        expect(onInnerExitComplete).toHaveBeenCalledTimes(1)
        expect(container.childNodes.length).toBe(0)
    })
})
