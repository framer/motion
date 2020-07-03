import * as React from "react"
import { motion } from "../../"
import { render } from "../../../jest.setup"
import {
    MockDrag,
    drag,
    frame,
    deferred,
} from "../../gestures/drag/__tests__/utils"

describe("pan", () => {
    test("pan handlers aren't frozen at pan session start", async () => {
        let count = 0
        const onPanEnd = deferred()
        const Component = () => {
            const [increment, setIncrement] = React.useState(1)
            return (
                <MockDrag>
                    <motion.div
                        onPanStart={() => {
                            count += increment
                            setIncrement(2)
                        }}
                        onPan={() => (count += increment)}
                        onPanEnd={() => {
                            count += increment
                            onPanEnd.resolve()
                        }}
                    />
                </MockDrag>
            )
        }

        const { container, rerender } = render(<Component />)
        rerender(<Component />)

        const pointer = await drag(container.firstChild).to(100, 100)
        await frame.postRender()
        await pointer.to(50, 50)
        await frame.postRender()
        pointer.end()
        await onPanEnd.promise

        expect(count).toBe(10)
    })
})
