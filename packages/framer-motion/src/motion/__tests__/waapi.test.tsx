import { render } from "../../../jest.setup"
import { motion, useMotionValue } from "../../"
import * as React from "react"
import { createRef } from "react"

/**
 * This assignment prevents Jest from complaining about
 * .animate() being undefined (as it's unsupported in node).
 */
Element.prototype.animate = (() => {}) as any

beforeAll(() => {
    jest.spyOn(Element.prototype, "animate").mockImplementation(
        (
            _keyframes: Keyframe[] | null | PropertyIndexedKeyframes,
            _options: KeyframeAnimationOptions | number | undefined
        ) => {
            return {} as any
        }
    )
})

afterAll(() => {
    jest.restoreAllMocks()
})

describe("WAAPI animations", () => {
    test("opacity animates with WAAPI", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
    })

    /**
     * TODO: We can probably remove this restriction in two steps.
     *  1) Limit to only if repeatDelay is defined as WAAPI doesn't support this
     *  2) Pre-generate keyframes if repeatDelay is defined (this would
     *      be incompatible with animating complex types like transform)
     */
    test("Doesn't animate with WAAPI if repeat is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: 1 }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
    })

    test("Doesn't animate with WAAPI if onUpdate is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onUpdate={() => {}}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
    })

    test("Doesn't animate with WAAPI if external motion value is defined", () => {
        const ref = createRef<HTMLDivElement>()
        const Component = () => (
            <motion.div
                ref={ref}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ opacity: useMotionValue(0) }}
            />
        )
        const { rerender } = render(<Component />)
        rerender(<Component />)

        expect(ref.current!.animate).toBeCalled()
    })
})
