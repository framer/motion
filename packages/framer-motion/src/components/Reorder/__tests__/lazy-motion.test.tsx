import { getFeatureDefinitions } from "motion-dom"
import { act, useContext, useState } from "react"
import { domMax, LazyMotion } from "../../.."
import { ReorderContext } from "../../../context/ReorderContext"
import { drag, MockDrag } from "../../../gestures/drag/__tests__/utils"
import { render } from "../../../jest.setup"
import { FeatureBundle } from "../../../motion/features/types"
import { Reorder } from "../../../m"

/**
 * #2232: Reorder rendered `motion` components, so importing it bundled every
 * feature (domMax) and LazyMotion couldn't defer them. `Reorder` from the `m`
 * entry renders `m` components, which get their features from LazyMotion.
 */
describe("Reorder (m) with LazyMotion", () => {
    let context: any = null
    const ContextCapture = () => {
        context = useContext(ReorderContext)
        return null
    }

    const Component = ({
        features,
        strict,
        onReorder,
    }: {
        features: FeatureBundle | (() => Promise<FeatureBundle>)
        strict?: boolean
        onReorder: (order: string[]) => void
    }) => {
        const [items, setItems] = useState(["a", "b"])

        return (
            <LazyMotion features={features} strict={strict}>
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

    // JSDOM has no layout, so give the items one
    const measure = () =>
        act(() => {
            context.registerItem("a", {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 50 },
            })
            context.registerItem("b", {
                x: { min: 0, max: 100 },
                y: { min: 50, max: 100 },
            })
        })

    function setup(element: React.ReactElement) {
        const result = render(element)
        result.rerender({ ...element })
        measure()
        return result
    }

    // Drag past the next item, in two moves to give it a velocity
    async function dragDown(element: Element) {
        const pointer = await drag(element).to(0, 50)
        await pointer.to(0, 100)
        pointer.end()
    }

    // Runs first: it checks features are only loaded once LazyMotion loads them
    it("is inert until LazyMotion loads its features", async () => {
        let loadFeatures!: (features: FeatureBundle) => void
        const features = () =>
            new Promise<FeatureBundle>((resolve) => (loadFeatures = resolve))
        const onReorder = jest.fn()

        const { getByTestId } = setup(
            <Component features={features} onReorder={onReorder} />
        )

        expect(getFeatureDefinitions().drag?.Feature).toBeUndefined()
        expect(getFeatureDefinitions().layout?.ProjectionNode).toBeUndefined()

        await dragDown(getByTestId("a"))
        expect(onReorder).not.toBeCalled()

        await act(async () => loadFeatures(domMax))
        measure()

        expect(getFeatureDefinitions().drag?.Feature).toBeDefined()

        await dragDown(getByTestId("a"))
        expect(onReorder).toBeCalledWith(["b", "a"])
    })

    it("renders within LazyMotion strict without a strict-mode warning", async () => {
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
        const onReorder = jest.fn()

        const { getByTestId } = setup(
            <Component features={domMax} strict onReorder={onReorder} />
        )

        await dragDown(getByTestId("a"))
        expect(onReorder).toBeCalledWith(["b", "a"])

        expect(warn).not.toBeCalled()
        warn.mockRestore()
    })
})
