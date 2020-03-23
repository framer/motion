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
            let remove: undefined | CB = undefined

            const Child = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (!isPresent) remove = safeToRemove
                }, [isPresent])

                return <div />
            }

            const Parent = ({ isVisible }: { isVisible: boolean }) => (
                <AnimatePresence>{isVisible && <Child />}</AnimatePresence>
            )

            const { container, rerender } = render(<Parent isVisible />)
            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            act(() => remove && remove())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        return await promise
    })

    test("Multiple children can exit", async () => {
        const promise = new Promise(resolve => {
            let removeA: undefined | CB = undefined
            let removeB: undefined | CB = undefined

            const ChildA = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (!isPresent) removeA = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const ChildB = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (!isPresent) removeB = safeToRemove
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

            act(() => removeA && removeA())

            expect(container.firstChild).toBeTruthy()

            act(() => removeB && removeB())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        return await promise
    })

    test("Multiple children can exit over multiple rerenders", async () => {
        const promise = new Promise(resolve => {
            let removeA: undefined | CB = undefined
            let removeB: undefined | CB = undefined

            const ChildA = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (!isPresent) removeA = safeToRemove
                }, [isPresent, safeToRemove])

                return <div />
            }

            const ChildB = () => {
                const [isPresent, safeToRemove] = usePresence()

                useEffect(() => {
                    if (!isPresent) removeB = safeToRemove
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

            act(() => removeA && removeA())

            rerender(<Parent isVisible={false} />)

            expect(container.firstChild).toBeTruthy()

            rerender(<Parent isVisible={false} />)

            act(() => removeB && removeB())

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        return await promise
    })
})
