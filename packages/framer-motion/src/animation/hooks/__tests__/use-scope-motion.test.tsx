import { render } from "@testing-library/react"
import { delay, hover } from "motion-dom"
import { StrictMode, useRef } from "react"
import { animate } from "../../animate"
import { useScopeMotion } from "../use-scope-motion"

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

describe("useScopeMotion", () => {
    test("resolves selectors inside the ref", async () => {
        const Component = () => {
            const ref = useRef<HTMLDivElement>(null)
            useScopeMotion(ref, () => {
                animate(".box", { opacity: 0.5 }, { duration: 0 })
            })
            return (
                <div ref={ref}>
                    <div className="box" data-testid="inside" />
                </div>
            )
        }

        const outside = document.createElement("div")
        outside.className = "box"
        document.body.appendChild(outside)

        const { getByTestId } = render(<Component />)
        await nextFrame()
        await nextFrame()

        expect(getByTestId("inside").style.opacity).toBe("0.5")
        expect(outside.style.opacity).toBe("")
        outside.remove()
    })

    test("cancels the scope on unmount", async () => {
        const delayed = jest.fn()
        let element: HTMLElement | null = null

        const Component = () => {
            const ref = useRef<HTMLDivElement>(null)
            useScopeMotion(ref, () => {
                element = ref.current
                animate(ref.current!, { x: 100 }, { duration: 10 })
                delay(delayed, 1000)
            })
            return <div ref={ref} style={{ color: "red" }} />
        }

        const { unmount } = render(<Component />)
        await nextFrame()
        await nextFrame()
        expect(element!.style.transform).not.toBe("")

        unmount()
        await new Promise((resolve) => setTimeout(resolve, 1100))

        expect(delayed).not.toHaveBeenCalled()
        expect(element!.getAttribute("style")).toBe("color: red;")
    })

    test("reruns setup when deps change", () => {
        const setup = jest.fn()
        const cleanup = jest.fn()

        const Component = ({ value }: { value: number }) => {
            const ref = useRef<HTMLDivElement>(null)
            useScopeMotion(
                ref,
                () => {
                    setup(value)
                    return cleanup
                },
                { deps: [value] }
            )
            return <div ref={ref} />
        }

        const { rerender } = render(<Component value={1} />)
        rerender(<Component value={1} />)
        expect(setup).toHaveBeenCalledTimes(1)

        rerender(<Component value={2} />)
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(setup).toHaveBeenLastCalledWith(2)
    })

    test("returns the current scope for event handlers", () => {
        let scope: ReturnType<typeof useScopeMotion> | undefined

        const Component = () => {
            const ref = useRef<HTMLDivElement>(null)
            scope = useScopeMotion(ref, () => {})
            return <div ref={ref} />
        }

        const { unmount } = render(<Component />)
        const current = scope!.current!
        expect(current.state).toBe("active")

        const stopHover = current.run(() => hover(document.body, () => {}))
        expect(typeof stopHover).toBe("function")

        unmount()
        expect(current.state).toBe("cancelled")
        expect(scope!.current).toBe(null)
    })

    test("leaves one active scope in StrictMode", () => {
        const setup = jest.fn()
        const scopes: any[] = []

        const Component = () => {
            const ref = useRef<HTMLDivElement>(null)
            useScopeMotion(ref, (s) => {
                setup()
                scopes.push(s)
            })
            return <div ref={ref} />
        }

        render(
            <StrictMode>
                <Component />
            </StrictMode>
        )

        expect(scopes.filter((s) => s.state === "active").length).toBe(1)
    })
})
