import { render } from "../../../../jest.setup"
import * as React from "react"
import { useEffect } from "react"
import { act } from "react-dom/test-utils"
import { AnimatePresence } from ".."
import { usePresence } from "../use-presence"

describe("usePresence", () => {
    test("Can defer unmounting", async () => {
        const promise = new Promise(resolve => {
            let remove: () => void | undefined = undefined

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

            if (remove) {
                act(() => remove())
            }

            expect(container.firstChild).toBeFalsy()

            resolve()
        })

        return await promise
    })
})
