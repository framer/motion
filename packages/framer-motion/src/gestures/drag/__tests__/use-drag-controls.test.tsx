import * as React from "react"
import { render } from "../../../../jest.setup"
import { motion, useDragControls } from "../../../"
import { MockDrag, drag } from "./utils"
import { nextFrame } from "../../__tests__/utils"

describe("useDragControls", () => {
    test(".start triggers dragging on a different component", async () => {
        const onDragStart = jest.fn()
        const Component = () => {
            const dragControls = useDragControls()
            return (
                <MockDrag>
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        data-testid="drag-handle"
                    />
                    <motion.div
                        drag
                        onDragStart={onDragStart}
                        dragControls={dragControls}
                        data-testid="draggable"
                    />
                </MockDrag>
            )
        }

        const { rerender, getByTestId } = render(<Component />)
        rerender(<Component />)

        const pointer = await drag(
            getByTestId("draggable"),
            getByTestId("drag-handle")
        ).to(100, 100)

        pointer.end()

        await nextFrame()

        expect(onDragStart).toBeCalledTimes(1)
    })

    test(".start triggers dragging on its parent", async () => {
        const onDragStart = jest.fn()
        const Component = () => {
            const dragControls = useDragControls()
            return (
                <MockDrag>
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        data-testid="drag-handle"
                    >
                        <motion.div
                            drag
                            onDragStart={onDragStart}
                            dragControls={dragControls}
                            data-testid="draggable"
                        />
                    </div>
                </MockDrag>
            )
        }

        const { rerender, getByTestId } = render(<Component />)
        rerender(<Component />)

        const pointer = await drag(
            getByTestId("draggable"),
            getByTestId("drag-handle")
        ).to(100, 100)

        pointer.end()
        await nextFrame()
        expect(onDragStart).toBeCalledTimes(1)
    })
})
