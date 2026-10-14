import { visualElementStore } from "motion-dom"
import { motion } from "../.."
import { render } from "../../jest.setup"

describe("dynamic layout prop", () => {
    test("Enables layout animations when layout changes from false to true", () => {
        const Component = ({ layout }: { layout: boolean | "position" }) => (
            <motion.div layout={layout} />
        )

        const { container, rerender } = render(<Component layout={false} />)
        const element = container.firstChild as HTMLElement
        const { projection } = visualElementStore.get(element)!

        expect(projection!.options.layout).toBe(false)
        expect(projection!.hasListeners("didUpdate")).toBe(false)

        rerender(<Component layout={true} />)

        expect(projection!.options.layout).toBe(true)
        expect(projection!.options.animationType).toBe("both")
        expect(projection!.hasListeners("didUpdate")).toBe(true)

        rerender(<Component layout="position" />)

        expect(projection!.options.layout).toBe("position")
        expect(projection!.options.animationType).toBe("position")
    })

    test("Enables layout animations on a draggable element when layout changes to true", () => {
        const Component = ({ layout }: { layout: boolean }) => (
            <motion.div drag layout={layout} />
        )

        const { container, rerender } = render(<Component layout={false} />)
        const element = container.firstChild as HTMLElement
        const projection = visualElementStore.get(element)!.projection as any

        expect(projection.hasLayoutListener).toBeFalsy()

        rerender(<Component layout={true} />)

        expect(projection.options.layout).toBe(true)
        expect(projection.hasLayoutListener).toBe(true)
    })
})
