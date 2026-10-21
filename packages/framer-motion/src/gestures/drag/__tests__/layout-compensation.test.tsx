import { createDelta, visualElementStore } from "motion-dom"
import { motion, motionValue } from "../../../"
import { render } from "../../../jest.setup"
import { drag, MockDrag } from "./utils"

/**
 * Fire a layout change on a dragged element's projection node, as if its
 * layout moved by `x`/`y` during the drag (e.g. a Reorder.Item moving into
 * another row of a wrapping list).
 */
function shiftLayout(element: Element, x: number, y: number) {
    const delta = createDelta()
    delta.x.translate = x
    delta.y.translate = y
    visualElementStore.get(element)!.projection!.notifyListeners("didUpdate", {
        delta,
        hasLayoutChanged: true,
    })
}

describe("drag layout compensation", () => {
    test("only compensates layout changes on the drag axis (#2255)", async () => {
        const x = motionValue(0)
        const y = motionValue(0)
        const Component = () => (
            <MockDrag>
                <motion.div drag="x" layout style={{ x, y }} />
            </MockDrag>
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        const element = container.firstChild as Element

        const pointer = await drag(element).to(100, 0)
        expect(x.get()).toBe(100)

        shiftLayout(element, -50, 50)

        // x keeps the element under the pointer, y follows its new layout
        expect(x.get()).toBe(50)
        expect(y.get()).toBe(0)

        await pointer.to(110, 0)
        expect(x.get()).toBe(60)
        expect(y.get()).toBe(0)

        pointer.end()
    })

    test("compensates every axis when dragging both", async () => {
        const x = motionValue(0)
        const y = motionValue(0)
        const Component = () => (
            <MockDrag>
                <motion.div drag layout style={{ x, y }} />
            </MockDrag>
        )

        const { container, rerender } = render(<Component />)
        rerender(<Component />)
        const element = container.firstChild as Element

        const pointer = await drag(element).to(100, 100)

        shiftLayout(element, -50, 50)
        expect(x.get()).toBe(50)
        expect(y.get()).toBe(150)

        pointer.end()
    })
})
