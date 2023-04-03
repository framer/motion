import { render } from "../../../jest.setup"
import { usePaintEffect } from "../use-paint-effect"
import * as React from "react"
import { sync } from "../../frameloop"

describe("usePaintEffect", () => {
    test("useEffect fires callback twice", async () => {
        const output: string[] = []

        await new Promise<void>((resolve) => {
            const Component = () => {
                const ref = React.useRef<HTMLSpanElement>(null)
                const [state, setState] = React.useState(0)

                React.useLayoutEffect(() => {
                    setState(state + 1)
                }, [])

                React.useEffect(() => {
                    output.push(ref.current!.innerHTML)

                    sync.postRender(() => {
                        sync.postRender(() => {
                            resolve()
                        })
                    })
                })

                return <span ref={ref}>{state}</span>
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        // Double effect in test mode
        expect(output).toEqual(["0", "0", "1", "1"])
    })

    test("usePaintEffect fires callback once", async () => {
        const output: string[] = []

        await new Promise<void>((resolve) => {
            const Component = () => {
                const ref = React.useRef<HTMLSpanElement>(null)
                const [state, setState] = React.useState(0)

                React.useLayoutEffect(() => {
                    setState(state + 1)
                }, [])

                usePaintEffect(() => {
                    output.push(ref.current!.innerHTML)

                    sync.postRender(() => {
                        sync.postRender(() => {
                            resolve()
                        })
                    })
                })

                return <span ref={ref}>{state}</span>
            }

            const { rerender } = render(<Component />)
            rerender(<Component />)
        })

        expect(output).toEqual(["1"])
    })

    test("Fires cleanup function", async () => {
        const output: number[] = []

        await new Promise<void>((resolve) => {
            const Component = () => {
                const ref = React.useRef<HTMLSpanElement>(null)
                const [state, setState] = React.useState(0)

                React.useLayoutEffect(() => {
                    setState(state + 1)
                }, [])

                usePaintEffect(() => {
                    return () => {
                        output.push(state)

                        sync.postRender(() => {
                            sync.postRender(() => {
                                resolve()
                            })
                        })
                    }
                })

                return <span ref={ref}>{state}</span>
            }

            const { rerender, unmount } = render(<Component />)
            rerender(<Component />)

            sync.postRender(() => {
                unmount()
            })
        })

        expect(output).toEqual([1])
    })
})
