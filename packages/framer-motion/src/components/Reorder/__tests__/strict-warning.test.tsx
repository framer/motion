import { act, useContext, useState } from "react"
import { domMax, LazyMotion, Reorder } from "../../.."
import { ReorderContext } from "../../../context/ReorderContext"
import { drag, MockDrag } from "../../../gestures/drag/__tests__/utils"
import { render } from "../../../jest.setup"

/**
 * #2094: the main `Reorder` renders `motion` components, so within
 * `LazyMotion strict` it warned "Import and render a `m` component instead"
 * for the Group and every Item, on every render. Users render `Reorder`, not
 * `motion`, so they couldn't act on it. It should warn once and point to the
 * `Reorder` that works with LazyMotion.
 */
it("Reorder within LazyMotion strict warns once, with a fix", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
    let context: any = null
    const ContextCapture = () => {
        context = useContext(ReorderContext)
        return null
    }
    const onReorder = jest.fn()

    const Component = () => {
        const [items, setItems] = useState(["a", "b", "c"])

        return (
            <LazyMotion features={domMax} strict>
                <MockDrag>
                    <Reorder.Group
                        axis="y"
                        values={items}
                        onReorder={(order) => {
                            onReorder(order)
                            setItems(order)
                        }}
                    >
                        <ContextCapture />
                        {items.map((item) => (
                            <Reorder.Item
                                key={item}
                                value={item}
                                data-testid={item}
                            />
                        ))}
                    </Reorder.Group>
                </MockDrag>
            </LazyMotion>
        )
    }

    const { getByTestId, rerender } = render(<Component />)
    rerender(<Component />)

    // JSDOM has no layout, so give the items one
    act(() => {
        ;["a", "b", "c"].forEach((item, i) =>
            context.registerItem(item, {
                x: { min: 0, max: 100 },
                y: { min: i * 50, max: (i + 1) * 50 },
            })
        )
    })

    // Drag past the next item, in two moves to give it a velocity
    const pointer = await drag(getByTestId("a")).to(0, 50)
    await pointer.to(0, 100)
    pointer.end()

    // Reorder still works with the features LazyMotion provides
    expect(onReorder).toBeCalledWith(["b", "a", "c"])

    const strictWarnings = warn.mock.calls.filter(([message]) =>
        String(message).includes("within a `LazyMotion` component")
    )
    expect(strictWarnings).toHaveLength(1)
    expect(strictWarnings[0][0]).toContain(
        'For Reorder, import it from "motion/react-m"'
    )

    warn.mockRestore()
})
