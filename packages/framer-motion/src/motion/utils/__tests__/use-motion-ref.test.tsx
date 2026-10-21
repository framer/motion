import * as React from "react"
import { createRef, useRef } from "react"
import { motion, MotionConfig, visualElementStore } from "../../.."
import { render } from "../../../jest.setup"

describe("useMotionRef", () => {
    it("should call external ref callback with element on mount", () => {
        const refCallback = jest.fn()

        const Component = () => {
            return <motion.div ref={refCallback} />
        }

        render(<Component />)

        expect(refCallback).toHaveBeenCalledTimes(1)
        expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement))
    })

    it("should call external ref callback with null on unmount", () => {
        const refCallback = jest.fn()

        const Component = () => {
            return <motion.div ref={refCallback} />
        }

        const { unmount } = render(<Component />)

        // Clear previous calls
        refCallback.mockClear()

        unmount()

        expect(refCallback).toHaveBeenCalledTimes(1)
        expect(refCallback).toHaveBeenCalledWith(null)
    })

    it("should call cleanup function on unmount when ref returns one (React 19)", () => {
        const cleanup = jest.fn()
        const refCallback = jest.fn(() => cleanup)

        const Component = () => {
            return <motion.div ref={refCallback} />
        }

        const { unmount } = render(<Component />)

        expect(refCallback).toHaveBeenCalledTimes(1)
        expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement))

        refCallback.mockClear()

        unmount()

        // Cleanup should be called, ref should NOT be called with null
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(refCallback).not.toHaveBeenCalledWith(null)
    })

    it("should handle RefObject refs correctly", () => {
        const Component = () => {
            const ref = useRef<HTMLDivElement>(null)
            return <motion.div ref={ref} />
        }

        const { unmount } = render(<Component />)

        // Should not throw on mount or unmount
        expect(() => unmount()).not.toThrow()
    })

    it("should handle mixed ref types in motion components", () => {
        const refCallback = jest.fn()

        const Component = ({ useCallback }: { useCallback: boolean }) => {
            const refObject = useRef<HTMLDivElement>(null)
            return <motion.div ref={useCallback ? refCallback : refObject} />
        }

        const { rerender } = render(<Component useCallback={true} />)

        expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement))

        // Should handle transition between ref types without errors
        expect(() => rerender(<Component useCallback={false} />)).not.toThrow()
    })

    it("should register VisualElement in visualElementStore before external ref callback runs", () => {
        let lookedUpVisualElement: unknown = "not-set"

        const refCallback = (instance: HTMLDivElement | null) => {
            if (instance) {
                lookedUpVisualElement = visualElementStore.get(instance)
            }
        }

        const Component = () => <motion.div ref={refCallback} />

        render(<Component />)

        expect(lookedUpVisualElement).toBeDefined()
        expect(lookedUpVisualElement).not.toBeNull()
    })

    it("should work with forwardRef components", () => {
        const cleanup = jest.fn()
        const refCallback = jest.fn(() => cleanup)

        const ForwardedComponent = React.forwardRef<HTMLDivElement>(
            (props, ref) => {
                return <motion.div ref={ref} {...props} />
            }
        )

        const Component = () => {
            return <ForwardedComponent ref={refCallback} />
        }

        const { unmount } = render(<Component />)

        expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement))

        refCallback.mockClear()

        unmount()

        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(refCallback).not.toHaveBeenCalledWith(null)
    })
    it("should hydrate a new RefObject when the ref changes (#2263)", () => {
        const refA = createRef<HTMLDivElement>()
        const refB = createRef<HTMLDivElement>()

        const Component = ({ r }: { r: React.RefObject<HTMLDivElement> }) => (
            <motion.div ref={r} />
        )

        const { container, rerender } = render(<Component r={refA} />)
        const element = container.firstChild as HTMLDivElement

        expect(refA.current).toBe(element)

        rerender(<Component r={refB} />)

        expect(refB.current).toBe(element)
        expect(refA.current).toBe(null)

        rerender(<Component r={refA} />)

        expect(refA.current).toBe(element)
        expect(refB.current).toBe(null)
    })

    it("should call a new callback ref and detach the old one when the ref changes", () => {
        const refA = jest.fn()
        const refB = jest.fn()

        const Component = ({ r }: { r: React.Ref<HTMLDivElement> }) => (
            <motion.div ref={r} />
        )

        const { container, rerender } = render(<Component r={refA} />)
        const element = container.firstChild as HTMLDivElement

        expect(refA).toHaveBeenCalledTimes(1)
        expect(refA).toHaveBeenLastCalledWith(element)

        rerender(<Component r={refB} />)

        expect(refA).toHaveBeenCalledTimes(2)
        expect(refA).toHaveBeenLastCalledWith(null)
        expect(refB).toHaveBeenCalledTimes(1)
        expect(refB).toHaveBeenLastCalledWith(element)

        // Re-rendering with the same ref doesn't call it again
        rerender(<Component r={refB} />)
        expect(refB).toHaveBeenCalledTimes(1)
    })

    it("should call a changed callback ref's cleanup instead of null (React 19)", () => {
        const cleanupA = jest.fn()
        const refA = jest.fn(() => cleanupA)
        const refB = jest.fn()

        const Component = ({ r }: { r: React.Ref<HTMLDivElement> }) => (
            <motion.div ref={r} />
        )

        const { container, rerender, unmount } = render(<Component r={refA} />)
        const element = container.firstChild as HTMLDivElement

        rerender(<Component r={refB} />)

        expect(cleanupA).toHaveBeenCalledTimes(1)
        expect(refA).not.toHaveBeenCalledWith(null)
        expect(refB).toHaveBeenLastCalledWith(element)

        unmount()

        expect(cleanupA).toHaveBeenCalledTimes(1)
        expect(refB).toHaveBeenLastCalledWith(null)
    })

    it("should attach and detach a ref added or removed after mount", () => {
        const ref = createRef<HTMLDivElement>()

        const Component = ({ r }: { r?: React.Ref<HTMLDivElement> }) => (
            <motion.div ref={r} />
        )

        const { container, rerender } = render(<Component />)
        const element = container.firstChild as HTMLDivElement

        rerender(<Component r={ref} />)
        expect(ref.current).toBe(element)

        rerender(<Component />)
        expect(ref.current).toBe(null)
    })

    it("should not remount the VisualElement when the ref changes", () => {
        const refs: HTMLDivElement[] = []

        const Component = ({ r }: { r: React.Ref<HTMLDivElement> }) => (
            <motion.div ref={r} />
        )

        const { container, rerender } = render(
            <Component r={(el) => el && refs.push(el)} />
        )
        const element = container.firstChild as HTMLDivElement
        const visualElement = visualElementStore.get(element)!
        const unmount = jest.spyOn(visualElement, "unmount")

        // A new inline callback ref on every render, like Radix UI's asChild
        rerender(<Component r={(el) => el && refs.push(el)} />)
        rerender(<Component r={(el) => el && refs.push(el)} />)

        expect(unmount).not.toHaveBeenCalled()
        expect(visualElementStore.get(element)).toBe(visualElement)
        expect(visualElement.current).toBe(element)
        expect(refs).toEqual([element, element, element])
    })
    it("should hydrate a changed ref in static mode", () => {
        const refA = createRef<HTMLDivElement>()
        const refB = createRef<HTMLDivElement>()

        const Component = ({ r }: { r: React.RefObject<HTMLDivElement> }) => (
            <MotionConfig isStatic>
                <motion.div ref={r} />
            </MotionConfig>
        )

        const { container, rerender } = render(<Component r={refA} />)
        const element = container.firstChild as HTMLDivElement

        expect(refA.current).toBe(element)

        rerender(<Component r={refB} />)

        expect(refB.current).toBe(element)
        expect(refA.current).toBe(null)
    })

    it("should hand a new element to a new ref without giving it to the old one", () => {
        const refA = jest.fn()
        const refB = jest.fn()

        const Switch = React.forwardRef<HTMLElement, { span?: boolean }>(
            ({ span }, ref) =>
                span ? (
                    <span ref={ref as React.Ref<HTMLSpanElement>} />
                ) : (
                    <div ref={ref as React.Ref<HTMLDivElement>} />
                )
        )
        const MotionSwitch = motion.create(Switch)

        const { container, rerender } = render(<MotionSwitch ref={refA} />)
        const div = container.firstChild

        rerender(<MotionSwitch ref={refB} span />)
        const span = container.firstChild

        expect(span).toBeInstanceOf(HTMLSpanElement)
        expect(refA.mock.calls).toEqual([[div], [null]])
        expect(refB.mock.calls).toEqual([[span]])
    })

    it("should support a state setter as a changing callback ref", () => {
        let node: HTMLElement | null = null

        const Component = () => {
            const [el, setEl] = React.useState<HTMLElement | null>(null)
            node = el
            // A new inline callback ref every render
            return <motion.div ref={(instance) => setEl(instance)} />
        }

        const { container } = render(<Component />)

        expect(node).toBe(container.firstChild)
    })

    it("should hydrate a changed ref before the parent's layout effects run", () => {
        const seen: Array<HTMLDivElement | null> = []

        const Component = ({ count }: { count: number }) => {
            const ref = React.useMemo(
                () => createRef<HTMLDivElement>(),
                [count]
            )
            React.useLayoutEffect(() => {
                seen.push(ref.current)
            }, [ref])
            return <motion.div ref={ref} />
        }

        const { container, rerender } = render(<Component count={0} />)
        rerender(<Component count={1} />)

        const element = container.firstChild
        expect(seen.length).toBeGreaterThanOrEqual(2)
        expect(seen.every((current) => current === element)).toBe(true)
    })
})
