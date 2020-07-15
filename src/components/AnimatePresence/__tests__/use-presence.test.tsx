import { render } from "../../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { act } from "react-dom/test-utils"
import { AnimatePresence } from ".."
import { usePresence } from "../use-presence"

type CB = () => void

describe("usePresence", () => {
    test("Can defer unmounting", async () => {
        const promise = new Promise(resolve => {
            let remove: CB

            const Child = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (safeToRemove) remove = safeToRemove
                }, [isPresent])

                return <div />
            }

            const Parent = ({ isVisible }: { isVisible: boolean }) => (
                <AnimatePresence>{isVisible && <Child />}</AnimatePresence>
            )

            const { container, rerender } = render(<Parent isVisible />)
            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            act(() => remove())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        await promise
    })

    test("Multiple children can exit", async () => {
        const promise = new Promise(resolve => {
            let removeA: CB
            let removeB: CB

            const ChildA = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (safeToRemove) removeA = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const ChildB = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (safeToRemove) removeB = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const Parent = ({ isVisible }: { isVisible: boolean }) => (
                <AnimatePresence>
                    {isVisible && (
                        <div>
                            <ChildA />
                            <ChildB />
                        </div>
                    )}
                </AnimatePresence>
            )

            const { container, rerender } = render(<Parent isVisible />)
            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            act(() => removeA())

            expect(container.firstChild).toBeTruthy()

            act(() => removeB())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        await promise
    })

    test("Multiple children can exit over multiple rerenders", async () => {
        const promise = new Promise(resolve => {
            let removeA: CB
            let removeB: CB

            const ChildA = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (safeToRemove) removeA = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const ChildB = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (safeToRemove) removeB = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const Parent = ({ isVisible }: { isVisible: boolean }) => (
                <AnimatePresence>
                    {isVisible && (
                        <div>
                            <ChildA />
                            <ChildB />
                        </div>
                    )}
                </AnimatePresence>
            )

            const { container, rerender } = render(<Parent isVisible />)
            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            act(() => removeA())

            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            rerender(<Parent isVisible={false} />)

            act(() => removeB())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        await promise
    })
})
